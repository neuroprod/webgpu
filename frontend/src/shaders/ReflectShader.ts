import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector3} from "math.gl";
import Camera from "../lib/Camera";
import {getWorldFromUVDepth} from "./ShaderChunks";


export default class ReflectShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("radius", 1.0);
        this.addTexture("lut", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gDepth", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gNormal", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gMRA", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gColor",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("reflectTexture", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        // this.addSampler("mySampler");
        this.needsCamera = true;
        this.logShaderCode = true;
    }



    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) uv0 : vec2f,
 
    @builtin(position) position : vec4f
  
}



${Camera.getShaderText(0)}
${this.getShaderUniforms(1)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.position =vec4( aPos,1.0);
    output.uv0 =aUV0;
   
    return output;
}

fn random(st : vec2f ) -> f32 {
  return fract(sin(dot(st.xy, vec2f(12.9898, 78.233))) * 43758.5453123)-0.5;
}
${getWorldFromUVDepth()}

fn fresnelSchlickRoughness( cosTheta:f32,  F0:vec3f, roughness:f32)-> vec3f
{
    return F0 + (max(vec3f(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}   
   


@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{
    let textureSize =vec2<f32>( textureDimensions(gNormal));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
    let mra =textureLoad(gMRA,  uvPos ,0).xyz ;
    
    
    let roughness = mra.y;
    let metallic = mra.x;
  if( roughness >0.5 && metallic<0.5){return  vec4f(0.0,0.0,0.0,1.0);}
    
    let albedo =pow(textureLoad(gColor,  uvPos ,0).xyz,vec3(2.2));
    
    
    let world=getWorldFromUVDepth(uv0,textureLoad(gDepth,  uvPos ,0).x); 
    let N = (textureLoad(gNormal,  uvPos ,0).xyz-0.5) *2.0;
    let V  = normalize(camera.worldPosition.xyz-world);
    let NdotV =max(dot(N, V), 0.0);
    let F0 = mix(vec3(0.04), albedo, metallic);
    let F =fresnelSchlickRoughness(NdotV, F0,roughness);
    let envUV = vec2<i32>(floor(vec2f(NdotV*400.0, roughness*400.0)));
    let envBRDF = textureLoad(lut,envUV,0).xy;
    let refValue = (F * envBRDF.x + envBRDF.y) ;

    
    var dir= normalize(reflect(-V,N))*0.05;
    var testPos = world+dir;
    var uv= vec2<i32>(0,0);
    var found =false;
    for (var i: i32 = 0; i < 10; i++) {
      
        let projTestPos = camera.viewProjectionMatrix *vec4(testPos,1.0);
        
        if( projTestPos.w<0.0){
            return  vec4f(0.01,0.01,0.01,1.0);
        }
        
        let screenTestPos  = projTestPos.xyz/projTestPos.w;
      
        
        let uvTestS = screenTestPos.xy*0.5+0.5; 
        
        let uvTest = vec2<i32>(floor(vec2(uvTestS.x,1-uvTestS.y)*textureSize));
        let textureDepth =textureLoad(gDepth,uvTest,0).x;
        let dist = screenTestPos.z-textureDepth;
        
       if(dist>0.01 ){
           
            found =true;
            break;
        }
        dir*=2.0;
        testPos += dir;
    }
    if(found){
    
      dir*=-0.5;
        var s =-1.0;
        for (var i: i32 = 0; i < 10; i++) {

            testPos+=dir;
            let projTestPos = camera.viewProjectionMatrix *vec4(testPos,1.0);
            let screenTestPos  = projTestPos.xyz/projTestPos.w;
      
        
            let uvTestS = screenTestPos.xy*0.5+0.5; 
        
            let uvTest = vec2<i32>(floor(vec2(uvTestS.x,1-uvTestS.y)*textureSize));
            let textureDepth =textureLoad(gDepth,uvTest,0).x;
            let dist = screenTestPos.z-textureDepth;
            if (dist>0.0){
                dir*=0.5*(-s);
                s= -1.0;
            }
            else {
                dir*=0.5*s;
                s= 1.0;
            }
            uv =uvTest;
            if (dist>-0.01 && dist<0.01){
            
                break;
            }



         }

    
    
    }else
    {
        return  vec4f(0.0,0.0,0.0,1.0);
    }
    if(uv.x==0) {return  vec4f(0.0,0.0,0.0,1.0);}
     let color =textureLoad(reflectTexture,uv,0).xyz*refValue;


    return vec4f(color,1.0);
     
}
///////////////////////////////////////////////////////////
        `
    }


}

import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {Vector4} from "math.gl";
import {getWorldFromUVDepth} from "./ShaderChunks";

export default class LightShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);


        }
        this.addUniform("position", new Vector4(0, -1.5, -3, 1));
        this.addUniform("color", new Vector4(1, 1, 1, 1));
        this.addUniform("shadow", new Vector4(1, 20, 1, 1));

        // this.addUniform("textureSize",new Vector2(10,10));
        //  this.addUniform("size",20.0);


        this.addTexture("gDepth", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gNormal", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gMRA", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gColor", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("ao", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.needsTransform = true;
        this.needsCamera = true;


    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{

    @location(0) projPos : vec4f,
    @builtin(position) position : vec4f
  
}
${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}
${getWorldFromUVDepth()}
fn rand(n:vec2f )->f32 { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
const PI = 3.14159265359;
fn fresnelSchlick(cosTheta:f32, F0:vec3f)-> vec3f
{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
fn DistributionGGX( N:vec3f,  H:vec3f,  roughness:f32)-> f32
{
    let a      = roughness*roughness;
    let a2     = a*a;
    let NdotH  = max(dot(N, H), 0.0);
    let NdotH2 = NdotH*NdotH;

    let num   = a2;
    var denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num / denom;
}
fn GeometrySmith( N:vec3f,  V:vec3f,  L:vec3f, roughness:f32)-> f32
{
    let NdotV = max(dot(N, V), 0.0);
    let NdotL = max(dot(N, L), 0.0);
    let ggx2  = GeometrySchlickGGX(NdotV, roughness);
    let ggx1  = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

fn GeometrySchlickGGX(NdotV:f32,  roughness:f32)-> f32
{
    let r = (roughness + 1.0);
    let k = (r*r) / 8.0;

    let num   = NdotV;
    let denom = NdotV * (1.0 - k) + k;

    return num / denom;
}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    
 

    var position = camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
    
    output.position =position;
    

   
    output.projPos =position;
  
    return output;
}

@fragment
fn mainFragment(@location(0) projPos: vec4f) -> @location(0) vec4f
{
    
    var uv0 = (projPos.xy/projPos.w)*0.5+0.5;
    uv0.y =1.0-uv0.y;
    let textureSize =vec2<f32>( textureDimensions(gDepth));
    let uvPos = vec2<i32>(floor(uv0*textureSize));

    let world=getWorldFromUVDepth(uv0 ,textureLoad(gDepth,  uvPos ,0).x); 
    let dist=distance (uniforms.position.xyz,world);
    
     let an=(1.0/pow(dist,2.0))*(1.0- pow(dist/uniforms.position.w,2.0)) ; 
 
    if( dist>uniforms.position.w){return vec4(0,0,0,0.0);}



   
if( uniforms.shadow.x>0.5){
     

     let traceDir =-normalize (world-uniforms.position.xyz)*uniforms.shadow.z;
    let numSteps =uniforms.shadow.y;
    let traceDirScaled = traceDir/numSteps ;
    let traceOffset =traceDirScaled*abs(rand(uv0))+world ;
    var c =1.0;
    for (var i = 0.0; i < numSteps; i+=1.0) {
        let tracePos= traceOffset + traceDirScaled *i;
        let screenPos = camera.viewProjectionMatrix*vec4(tracePos,1.0);
        var screenUV= (screenPos.xy/screenPos.w)*0.5+0.5;
        screenUV.y= 1.0-screenUV.y;
       
        let screenUVi = vec2<i32>(floor( screenUV*textureSize));
        //let worldS=textureLoad(gPosition,  screenUVi ,0).xyz; 
        
        let worldS =getWorldFromUVDepth(screenUV ,textureLoad(gDepth,  screenUVi ,0).x); 
        
        
        if(worldS.z==0) {continue;}
        let worldDist = distance(worldS,camera.worldPosition.xyz);
        let diff = distance(tracePos,camera.worldPosition.xyz)-distance(worldS,camera.worldPosition.xyz);
        if(diff>0.01 && diff <uniforms.shadow.w){
           return vec4(0.0,0.0,0.0,0.0);
       
        }
    }
}
       let albedo =pow(textureLoad(gColor,  uvPos ,0).xyz,vec3(2.2));
       
      
      

  
        let N =normalize( (textureLoad(gNormal,  uvPos ,0).xyz-0.5) *2.0);
   
   
        let mra =textureLoad(gMRA,  uvPos ,0).xyz ;
         let ao =textureLoad(ao,  uvPos ,0).x ;
        let roughness = mra.y;
        let metallic = mra.x;

        let V = normalize(camera.worldPosition.xyz - world);
        let F0 = mix(vec3(0.04), albedo, metallic);
       
        let lightVec = uniforms.position.xyz - world;
        let L = normalize(lightVec);
        let H = normalize(V + L);
        let NdotV = max(0.0, dot(N, V));
        let NDF = DistributionGGX(N, H, roughness);
        let G   = GeometrySmith(N, V, L, roughness);
        let F    = fresnelSchlick(max(dot(H, V), 0.0), F0);
 
        let kS = F;
        let kD = vec3(1.0) - kS;
    
        let numerator    = NDF * G * F;
        let denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
        let specular     = numerator / denominator;
    
        let radiance =uniforms.color.xyz *uniforms.color.w*an;
    
        let NdotL = max(dot(N, L), 0.0);
        let light= (kD * albedo / PI + specular) * radiance * NdotL ;
        
        return vec4( light*ao,0.0);
}
///////////////////////////////////////////////////////////
       
        `
    }
}



import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector4} from "math.gl";
import Camera from "../lib/Camera";
import {fresnelSchlickRoughness, getWorldFromUVDepth, ssr} from "./ShaderChunks";


export default class ReflectShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("refSettings1", new Vector4());
        this.addUniform("refSettings2", new Vector4());
        this.addTexture("lut", this.renderer.texturesByLabel["brdf_lut.png"], "unfilterable-float")
        this.addTexture("gDepth", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gNormal", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gMRA", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gColor", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("reflectTexture", DefaultTextures.getWhite(this.renderer), "float")
        this.addSampler("mySampler");
        this.needsCamera = true;

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
${fresnelSchlickRoughness()}
${ssr()}
@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{
    let textureSize =vec2<f32>( textureDimensions(gNormal));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
    let mra =textureLoad(gMRA,  uvPos ,0).xyz ;
    
    
    var roughness = mra.y;
    let metallic = mra.x;
  if( roughness >0.5 &&  metallic<0.5){return  vec4f(0.0,0.0,0.0,1.0);}

    let albedo =pow(textureLoad(gColor,  uvPos ,0).xyz,vec3(2.2));
    
    
    let world=getWorldFromUVDepth(uv0,textureLoad(gDepth,  uvPos ,0).x); 
    let N =normalize( (textureLoad(gNormal,  uvPos ,0).xyz-0.5) *2.0);
    let V  = normalize(camera.worldPosition.xyz-world);
    let NdotV =max(dot(N, V), 0.0);
    let F0 = mix(vec3(0.04), albedo, metallic);
    let F =fresnelSchlickRoughness(NdotV, F0,roughness);
    let envUV = vec2<i32>(floor(vec2f(NdotV*400.0, roughness*400.0)));
    let envBRDF = textureLoad(lut,envUV,0).xy;
    let refValue = (F * envBRDF.x + envBRDF.y) ;

  
    let c = ssr(world,N,V,metallic,roughness,textureSize);
    return vec4(c*refValue,1.0);
   
}
///////////////////////////////////////////////////////////
        `
    }


}

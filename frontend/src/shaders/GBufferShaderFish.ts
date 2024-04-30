import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class GBufferShaderFish extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aTangent", ShaderType.vec4);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("time", 1);
        this.addUniform("scale", 1);

        this.addTexture("colorTexture", this.renderer.texturesByLabel["textures/fish_Color.webp"])
        this.addTexture("mraTexture", this.renderer.texturesByLabel["textures/fish_MRA.webp"])
        this.addTexture("normalTexture", this.renderer.texturesByLabel["textures/fish_Normal.webp"])
        this.addSampler("mySampler")

        this.needsTransform = true;
        this.needsCamera = true;
    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
   @location(0) uv0 : vec2f,
    @location(1) normal : vec3f,
    @location(2) tangent : vec3f,
    @location(3) biTangent : vec3f,
  
    @builtin(position) position : vec4f
  
}
struct GBufferOutput {
  @location(0) color : vec4f,
  @location(1) normal : vec4f,
    @location(2) mra : vec4f,
   
}

${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var pos = aPos;
   pos.z +=sin(pos.x*10.0+uniforms.time*5.0)*0.04*smoothstep(-0.2,0.2,pos.x);

    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( pos ,1.0);
    output.uv0 =aUV0;
    let d = cos(pos.x*10.0+uniforms.time*5.0)*0.5*smoothstep(-0.2,0.2,pos.x);
    output.normal =model.normalMatrix *(aNormal+vec3(0.0,0.0,-d));
    output.tangent =model.normalMatrix*aTangent.xyz;
     output.biTangent =model.normalMatrix* (normalize(cross( normalize(aTangent.xyz), normalize(aNormal)))*aTangent.w);
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f,@location(2) tangent: vec3f,@location(3) biTangent: vec3f) -> GBufferOutput
{
    var output : GBufferOutput;
  


    output.color = textureSample(colorTexture, mySampler,  uv0);
 
  
 
    var normalText = textureSample(normalTexture, mySampler,  uv0).xyz* 2. - 1.;
    
    let N = mat3x3f(normalize(tangent),normalize(biTangent),normalize(normal))*normalize(normalText);
    output.normal =vec4(normalize(N)*0.5+0.5,1.0);
    
  
   
    output.mra =textureSample(mraTexture, mySampler,  uv0) ;
 

  return output;
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

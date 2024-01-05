import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {TextureDimension} from "../lib/WebGPUConstants";

export default class GBufferShaderWind extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aColor", ShaderType.vec4);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aTangent",ShaderType.vec4);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("time",1);
        this.addUniform("normalAdj",0);
        this.addTexture("wind",this.renderer.texturesByLabel["SimplexNoise"],"float",TextureDimension.TwoD,GPUShaderStage.VERTEX)

        this.addTexture("opTexture",DefaultTextures.getWhite(this.renderer))
        this.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer))
        this.addTexture("mraTexture",DefaultTextures.getMRE(this.renderer))
        this.addTexture("normalTexture",DefaultTextures.getNormal(this.renderer))
        this.addSampler("mySampler",GPUShaderStage.FRAGMENT|GPUShaderStage.VERTEX)

        this.needsTransform =true;
        this.needsCamera=true;
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

     var world = model.modelMatrix *vec4( aPos,1.0);
     let t = textureLoad( wind, vec2<i32>(floor(world.xy*25.0)+vec2(1024.0,0)),0).xyz-vec3(0.5,0.5,0.0);
   world.x=world.x+t.x*aColor.x*0.1*t.z;
      world.z=world.z+t.y*aColor.x*0.1*t.z;
       
    output.position =camera.viewProjectionMatrix*world;
   
    output.uv0 =aUV0;

    output.normal =model.normalMatrix *aNormal+vec3(0.0,uniforms.normalAdj,0.0);
    output.tangent =model.normalMatrix*aTangent.xyz;
     output.biTangent =model.normalMatrix* (normalize(cross( normalize(aTangent.xyz), normalize(aNormal)))*aTangent.w);
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f,@location(2) tangent: vec3f,@location(3) biTangent: vec3f) -> GBufferOutput
{
    var output : GBufferOutput;
  
    let a= textureSample(opTexture, mySampler,  uv0).x;
    if(a<0.5){discard;}

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

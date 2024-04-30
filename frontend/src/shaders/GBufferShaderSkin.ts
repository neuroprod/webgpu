import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class GBufferShaderSkin extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aTangent", ShaderType.vec4);
            this.addAttribute("aUV0", ShaderType.vec2);
            this.addAttribute("aWeights", ShaderType.vec4);
            this.addAttribute("aJoints", ShaderType.vec4i);
        }
        // this.addUniform("skinMatrices",0,GPUShaderStage.FRAGMENT,ShaderType.mat4,64);
        //    this.addUniform("skinMatrices",0);
        this.addTexture("opTexture", DefaultTextures.getWhite(this.renderer))
        this.addTexture("colorTexture", DefaultTextures.getWhite(this.renderer))
        this.addTexture("mraTexture", DefaultTextures.getMRE(this.renderer))
        this.addTexture("normalTexture", DefaultTextures.getNormal(this.renderer))
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
struct Skin
{
    matrices : array<mat4x4<f32>,140>
}
@group(3) @binding(0)  var<uniform> skin : Skin ;




@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    var skinMatrix = skin.matrices[aJoints.x]*aWeights.x;
    skinMatrix+= skin.matrices[aJoints.y]*aWeights.y;
    skinMatrix+= skin.matrices[aJoints.z]*aWeights.z;
   skinMatrix+= skin.matrices[aJoints.w]*aWeights.w;
    
    output.position =camera.viewProjectionMatrix*skinMatrix *vec4( aPos,1.0);
    output.uv0 =aUV0;

    output.normal =(skinMatrix *vec4(aNormal,0.0)).xyz;
    output.tangent =(skinMatrix *vec4(aTangent.xyz,0.0)).xyz;
    let bitangent = (normalize(cross( normalize(aTangent.xyz), normalize(aNormal)))*aTangent.w);
     output.biTangent =(skinMatrix *vec4(bitangent,0.0)).xyz;;
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f,@location(2) tangent: vec3f,@location(3) biTangent: vec3f) -> GBufferOutput
{
  var output : GBufferOutput;
    output.color = textureSample(colorTexture, mySampler,  uv0);
    
   //let a= textureSample(opTexture, mySampler,  uv0).x;
    //if(a<0.5){discard;}
 
    var normalText = textureSample(normalTexture, mySampler,  uv0).xyz* 2. - 1.;
    normalText.y=normalText.y*-1.0; 
    //normalText.z=normalText.z*-1.0; 
  let N = mat3x3f(normalize(tangent),normalize(biTangent),normalize(normal))*normalize(normalText);
    
    output.normal =vec4(normalize(N)*0.5+0.5,1.0);
    
  
   
    output.mra =textureSample(mraTexture, mySampler,  uv0) ;
 

  return output;
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

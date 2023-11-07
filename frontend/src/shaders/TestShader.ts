import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/core/ModelTransform";

export default class TestShader extends Shader{

    init(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aNormal", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addUniform("scale",0.3);
        this.addTexture("testTexture",DefaultTextures.getGrid(this.renderer))
        this.addSampler("mySampler")
      // this.addVertexOutput("normal",3);
       // this.addVertexOutput("uv0",2);
    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) normal : vec3f,
     @location(1) uv0 : vec2f,
    @builtin(position) position : vec4f
  
}
${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms()}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);

    output.normal =model.normalMatrix *aNormal;
    output.uv0 =aUV0;
    return output;
}


@fragment
fn mainFragment(@location(0) normal: vec3f,@location(1) uv0: vec2f) -> @location(0) vec4f
{
 
    let color = textureSample(testTexture, mySampler,  uv0);
     return color ;
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}

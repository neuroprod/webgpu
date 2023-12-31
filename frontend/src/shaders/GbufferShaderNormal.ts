import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class GBufferShaderNormal extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);


        }
        this.addUniform("scale",1);


        this.needsTransform =true;
        this.needsCamera=true;
        //this.logShaderCode=true;
    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
 
    @location(0) normal : vec3f,

  
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
    
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
 

    output.normal =model.normalMatrix *aNormal;
   return output;
}


@fragment
fn mainFragment(@location(0) normal: vec3f) -> GBufferOutput
{
  var output : GBufferOutput;
    output.color =vec4( normalize(normal)*0.5+0.5,1.0);
    output.normal =vec4(normalize(normal)*0.5+0.5,1.0);
    output.mra =vec4(0,1,0.3,1.0);
 

  return output;
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}

import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class DepthShader extends Shader{
    private needsFragment: boolean=true;


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);

        }


        this.needsTransform =true;
        this.needsCamera=true;

    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) normal : vec3f,
    @builtin(position) position : vec4f
  
}


${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}


@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.normal = aNormal;
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);


    return output;
}
@fragment
fn mainFragment(@location(0) normal: vec3f)  -> @location(0) vec4f
{



 

  return vec4(normalize(normal)*0.5+0.5,1.0);
 
}

        
        
        
        
        
        
        
        
        `
    }



}

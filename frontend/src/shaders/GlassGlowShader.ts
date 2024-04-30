import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class GlassGlowShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);


        }

        this.needsTransform = true;
        this.needsCamera = true;

    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
 
    @builtin(position) position : vec4f
  
}

${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}





@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
   
   
    return output;
}


@fragment
fn mainFragment() -> @location(0) vec4f
{

  return vec4(vec3(3.0,2.5,2.0),1.0);
 
}
///////////////////////////////////////////////////////////
              
        `
    }


}

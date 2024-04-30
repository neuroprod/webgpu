import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";


export default class SparkShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        // this.addUniform("refSettings1", new Vector4());
        this.addTexture("image", this.renderer.texturesByLabel["spark.png"]);

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
   
    @builtin(position) position : vec4f
  
}


${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}

${this.getShaderUniforms(2)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var pos = aPos;
   
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( pos,1.0);
    output.uv0 =aUV0;
  
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f) -> @location(0) vec4f
{
   
  let alpha = textureSample(image, mySampler,uv0 ).x;
  return vec4(vec3(5.0,5.0,5.0)*alpha,alpha);
 
}
///////////////////////////////////////////////////////////
              
        `
    }


}

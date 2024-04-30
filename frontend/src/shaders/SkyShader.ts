import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {Vector4} from "math.gl";
import MathArray from "@math.gl/core/src/classes/base/math-array";

export default class SkyShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("colorTop", new Vector4() as MathArray)
        this.addUniform("colorBottom", new Vector4() as MathArray)
        this.addUniform("dayNight", 0)
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
    
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
    output.uv0 =aUV0;
   
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f) -> @location(0) vec4f
{
   
 let color = mix(uniforms.colorTop.xyz,uniforms.colorBottom.xyz,uv0.y)*uniforms.dayNight;
  return vec4(vec3(color)*1.0,1.00);
 
}
///////////////////////////////////////////////////////////
              
        `
    }


}

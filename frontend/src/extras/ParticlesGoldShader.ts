import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {Vector4} from "math.gl";
import MathArray from "@math.gl/core/src/classes/base/math-array";


export default class ParticlesGoldShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);
            this.addAttribute("instanceData", ShaderType.vec4, 1, "instance");
        }
        this.addUniform("sett", new Vector4(0.04, 0.18, -0.00) as MathArray);
        this.addUniform("color", new Vector4(1, 1, 0.67, 1) as MathArray);
        this.addUniform("time", 0);
        this.addUniform("fade", 0);

        this.needsTransform = true;
        this.needsCamera = true;

    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
   @location(0) uv0 : vec2f,
   @location(1) al : vec2f,
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
fn rotation3dZ(angle:f32) -> mat3x3<f32> {
  let s = sin(angle);
  let c = cos(angle);

  return mat3x3<f32>(
    c, s, 0.0,
    -s, c, 0.0,
    0.0, 0.0, 1.0
  );
}

fn rotation3dY(angle:f32) -> mat3x3<f32> {
  let s = sin(angle);
  let c = cos(angle);

  return mat3x3<f32>(
  c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var pos = aPos;
    pos.x *=uniforms.sett.x/10.0;
    pos.z*=uniforms.sett.y;
    let off = (instanceData.x +uniforms.time*instanceData.z)%1.0;
    pos.z +=off;
   output.al =vec2(1.0-off,instanceData.w);
     pos =rotation3dY(instanceData.y)*pos;
     
    // pos.y +=-instanceData.x*0.1-aPos.y*0.5;
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( pos,1.0);
    output.uv0 =aUV0;
 
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) al: vec2f) -> GBufferOutput
{
   var output : GBufferOutput;
   var a  =step((0.5+al.y)+(uniforms.fade),al.x);
   
    if(a<0.9) {
    discard;
    }
    
   output.color =uniforms.color;

  
 
    output.normal =vec4(0.0,0.0,1.0,1.0);
    
  
   
    output.mra =vec4(0.0,1.0,1.0,uniforms.sett.z);
   

  return output;
 
}
///////////////////////////////////////////////////////////
              
        `
    }


}

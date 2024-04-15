import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";


export default class ParticlesGoldShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);
            this.addAttribute("instanceData", ShaderType.vec4,1,"instance");
        }
        this.addUniform("time", 0);


        this.needsTransform =true;
        this.needsCamera=true;
this.logShaderCode =true;
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
    pos.x *=0.005;
    pos.z*=0.2;
    let off = (instanceData.x +uniforms.time*instanceData.z)%1.0;
    pos.z +=off;
   output.al =vec2(1.0-off);
     pos =rotation3dY(instanceData.y)*pos;
     
    // pos.y +=-instanceData.x*0.1-aPos.y*0.5;
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( pos,1.0);
    output.uv0 =aUV0;
 
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) al: vec2f) -> @location(0) vec4f
{
   
 let a  =smoothstep(0.2,0.3,al.x);
  return vec4(mix(vec3(2.0,2.0,2.0),vec3(1.0,1.0,1.0),uv0.y)*a,a);
 
}
///////////////////////////////////////////////////////////
              
        `
    }



}

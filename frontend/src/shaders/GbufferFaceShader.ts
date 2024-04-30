import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

import {Vector4} from "math.gl";

export default class GBufferFaceShader extends Shader {


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
        this.addUniform("eyeLeft", new Vector4(0.3, 0.5, 0.1));
        this.addUniform("eyeRight", new Vector4(0.7, 0.5, 0.1));
        this.addUniform("pupilLeft", new Vector4(0.3, 0.5, 0.02));
        this.addUniform("pupilRight", new Vector4(0.7, 0.5, 0.02));
        this.addUniform("mouthLeft", new Vector4(0.3, 0.7, 0.02));
        this.addUniform("mouthRight", new Vector4(0.7, 0.7, 0.02));
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

fn circle( posRad: vec3f, uv:  vec2f)->f32
{
    let  d = distance(posRad.xy, uv);
    return step(0.0,posRad.z-d);
}
fn line_segment (a: vec2f, b: vec2f,thick:f32 , uv:vec2f)->f32{
    let ba = b - a;
    let pa = uv - a;
   let h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.);
    return step(0.0,thick -length(pa - h * ba));
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f,@location(2) tangent: vec3f,@location(3) biTangent: vec3f) -> GBufferOutput
{
  var output : GBufferOutput;
  

  let eye = circle(uniforms.eyeLeft.xyz,uv0)+ circle(uniforms.eyeRight.xyz,uv0);
  let pupil = circle(uniforms.pupilLeft.xyz,uv0)+ circle(uniforms.pupilRight.xyz,uv0);
  let mouth  =line_segment(uniforms.mouthLeft.xy,uniforms.mouthRight.xy,uniforms.mouthLeft.z,uv0);
  if(mouth+eye+pupil  <0.5) {discard;}
  
  var color =vec4(1.0,1.0,1.0,1.0);
  var mra  =vec4(0.0,0.3,0.0,1.0);
  if(pupil >0.5){
  color =vec4(0.0,0.0,0.0,1.0);
   var mra  =vec4(0.0,0.1,0.0,1.0);
  }
  if(mouth >0.5){
  color =vec4(0.0,0.0,0.0,1.0);
  mra  =vec4(0.0,0.8,0.0,1.0);
  }
  output.color = color;
  output.normal =vec4(normalize(normal)*0.5+0.5,1.0);
  output.mra =mra;
 

  return output;
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

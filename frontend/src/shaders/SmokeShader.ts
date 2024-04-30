import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {AddressMode} from "../lib/WebGPUConstants";


export default class SmokeShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("time", 0);
        this.addTexture("noise", this.renderer.texturesByLabel["noiseTexture.png"], "float");
        this.addSampler("mySampler", GPUShaderStage.FRAGMENT, AddressMode.Repeat);

        this.needsTransform = true;
        this.needsCamera = true;
    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{

     @location(0) uv : vec2f,
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
    output.uv =aUV0;
    return output;
}


@fragment
fn mainFragment(@location(0) uv: vec2f) ->   @location(0) vec4f
{
    
   var uvv =uv+vec2(0.0,-uniforms.time*0.5);
    uvv = uvv*vec2(0.5,0.4);
      var noise =max(0,textureSample(noise, mySampler,   uvv).x-0.2-(uv.y*0.3));
  noise*=smoothstep(0.0,0.2,uv.x)*smoothstep(0.0,0.2,1.0-uv.x);
  noise*=smoothstep(0.0,0.1,uv.y)*smoothstep(0.0,0.2,1.0-uv.y);
  noise*=noise;
   noise*=2.0;
  return vec4f(vec3(1.0),noise);
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

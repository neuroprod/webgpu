import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {TextureDimension} from "../lib/WebGPUConstants";

export default class DustShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);
            this.addAttribute("instancePos", ShaderType.vec4, 1, "instance");

        }

        this.addUniform("time", 0);

        this.addTexture("noiseTexture", this.renderer.texturesByLabel["noiseTexture.png"], "float", TextureDimension.TwoD, GPUShaderStage.VERTEX)


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
${this.getShaderUniforms(2)}

fn noise(p_par: vec3<f32>) -> f32 {
    var p = p_par;
    let ip: vec3<f32> = floor(p);
    p = p - ip;
    let s = vec3<f32>(7., 157., 113.);
    var h = vec4<f32>(0., s.yz, s.y + s.z)+dot(ip, s);
    p = p * p * (3. - p * 2.);
    h = mix(fract(sin(h)*43758.5), fract(sin(h+s.x)*43758.5), p.x);
    let h2 = mix(h.xz, h.yw, p.y);
    return mix(h2.x, h2.y, p.z);
}

fn fbm(p_par: vec3<f32>, octaveNum: i32) -> f32 {
    var p = p_par;
    var acc = 0.0;
    let freq = 1.0;
    var amp = 0.5;
    let shift = vec3<f32>(100.);
    for (var i = 0; i < octaveNum; i = i + 1) {
        acc = acc +noise(p) * amp;
        p = p * 2.0 + shift;
        amp = amp * 0.5;
    }
    return acc;
}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var insPos =instancePos.xyz;


    insPos.z+=fbm(vec3(insPos.xy,uniforms.time),1)*3.0;
    insPos.x+=fbm(vec3(insPos.yz,uniforms.time),1)*6.0;
    insPos.y+=fbm(vec3(insPos.xz,uniforms.time),1)*3.0;
    var pos =vec4(instancePos.w* aPos+insPos,1.0);
   

    var world=model.modelMatrix *pos;
  
    
    output.position =camera.viewProjectionMatrix*world;
  
   
    return output;
}


@fragment
fn mainFragment()  -> @location(0) vec4f
{
  
 

  return vec4(vec3(1.0),0.02);
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

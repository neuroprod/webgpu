import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";


export default class PostShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("exposure", 0);
        this.addUniform("contrast", 0);
        this.addUniform("brightness", 0);
        this.addUniform("vibrance", 0);
        this.addUniform("saturation", 0);
        this.addUniform("black", 1);
        this.addUniform("falloff", 0.0);
        this.addUniform("amount", 0.0);
        this.addUniform("bloom_strength", 0.0)
        this.addTexture("colorTexture", DefaultTextures.getWhite(this.renderer), "float")
        this.addTexture("bloomTexture", DefaultTextures.getWhite(this.renderer), "float")
        this.addTexture("outlineTexture", DefaultTextures.getWhite(this.renderer), "float")
        this.addTexture("outlineBlurTexture", DefaultTextures.getWhite(this.renderer), "float")
        this.addSampler("mySampler");

    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) uv0 : vec2f,
 
    @builtin(position) position : vec4f
  
}

const m1 = mat3x3f(
    0.59719, 0.07600, 0.02840,
    0.35458, 0.90834, 0.13383,
    0.04823, 0.01566, 0.83777
    );
const m2 = mat3x3f(
    1.60475, -0.10208, -0.00327,
    -0.53108,  1.10813, -0.07276,
    -0.07367, -0.00605,  1.07602
    );
fn acestonemap( color:vec3f)->vec3f{
  
    let v = m1 * color;
    let a = v * (v + 0.0245786) - 0.000090537;
    let b = v * (0.983729 * v + 0.4329510) + 0.238081;
    let r=m2 * (a / b);
    return pow(clamp(r, vec3f(0.0), vec3f(1.0)), vec3f(1. / 2.2));
}


${this.getShaderUniforms(0)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
 
    
    output.position =vec4( aPos,1.0);
    
  
    output.uv0 =aUV0;
   
    return output;
}


@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{

    var color=   textureSample(colorTexture, mySampler,uv0).xyz;
    color+=   textureSample(bloomTexture, mySampler,uv0).xyz*uniforms.bloom_strength ;
 
    
    color = color * pow( uniforms.exposure,2.0);
    
     let dist = distance( uv0, vec2(0.5, 0.5));
    color =color* smoothstep(0.8, uniforms.falloff * 0.799, dist * (uniforms.amount + uniforms.falloff));
  
    color =acestonemap(color);
    
    color=  color * uniforms.contrast;
     color =  color + vec3(uniforms.brightness);
    
    
    
    let luminance = color.r*0.299 + color.g*0.587 + color.b*0.114;
    let mn = min(min(color.r, color.g), color.b);
    let mx = max(max(color.r, color.g), color.b);
    let sat = (1.0-(mx - mn)) * (1.0-mx) * luminance * 5.0;
    let lightness = vec3((mn + mx)/2.0);

    
    color = mix(color, mix(color, lightness, -uniforms.vibrance), sat);
    color = mix(color, lightness, (1.0-lightness)*(1.0-uniforms.vibrance)/2.0*abs(uniforms.vibrance));
    color = mix(color, vec3(luminance), -uniforms.saturation);

   let outlineBlur =textureSample(outlineBlurTexture, mySampler,uv0).xy;
    let outline= outlineBlur.x - textureSample(outlineTexture, mySampler,uv0).x;
    color =mix(color,vec3f(0.90,0.83,0.65),max(smoothstep(0.0,0.1,outline)-smoothstep(0.0,0.1,outlineBlur.y)*0.7,0.0));
    return vec4(color*uniforms.black,1.0) ;
}
///////////////////////////////////////////////////////////
        `
    }


}

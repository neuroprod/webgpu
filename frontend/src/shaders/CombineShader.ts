import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";



export default class CombineShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform( "threshold",1);
        this.addUniform( "softThreshold",0.1);


        this.addTexture("glassTexture",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("refTexture",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("lightTexture",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        // this.addSampler("mySampler");

    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) uv0 : vec2f,
 
    @builtin(position) position : vec4f
  
}
struct ColorOutput {
  @location(0) color : vec4f,
  @location(1) bloom : vec4f,

   
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
fn mainFragment(@location(0)  uv0: vec2f) -> ColorOutput
{
 var output : ColorOutput;
    let textureSize =vec2<f32>( textureDimensions(lightTexture));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
    var color=textureLoad(lightTexture,  uvPos ,0).xyz; ;
    color+=textureLoad(refTexture,  uvPos ,0).xyz; ;
    
    
    
    let glass  =textureLoad(glassTexture,  uvPos ,0);
    color =mix(color,glass.xyz,vec3(glass.w));
    
    
    let brightness =min( max(color.r, max(color.g, color.b)),2.0);
 
    let knee = uniforms.threshold * uniforms.softThreshold;
    var soft = brightness - uniforms.threshold + knee;
    soft = clamp(soft, 0, 2 * knee);
    soft = soft * soft / (4 * knee + 0.00001);
    var contribution = max(soft, brightness - uniforms.threshold);
    contribution /= max(brightness, 0.00001);
    
    output.color = vec4f(color,1.0);
    output.bloom = vec4f(color*contribution,1.0);
   
    return output;
}
///////////////////////////////////////////////////////////
        `
    }



}

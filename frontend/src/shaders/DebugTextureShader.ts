import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";


export default class DebugTextureShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("rtype", 0)
        this.addTexture("colorTexture", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
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
      let textureSize =vec2<f32>( textureDimensions(colorTexture));
      let uvPos = vec2<i32>(floor(uv0*textureSize));
      let color=textureLoad(colorTexture,  uvPos ,0); ;
       if(uniforms.rtype>3.5){
      return vec4(color.w,color.w,color.w,1.0) ;
      }
      else if(uniforms.rtype>2.5){
      return vec4(color.z,color.z,color.z,1.0) ;
      }
      else if(uniforms.rtype>1.5){
      return vec4(color.y,color.y,color.y,1.0) ;
      }
      else if(uniforms.rtype>0.5){
      return vec4(color.x,color.x,color.x,1.0) ;
      }
      
     return vec4(color.xyz,1.0) ;
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

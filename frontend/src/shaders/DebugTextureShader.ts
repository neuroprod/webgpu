import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector2} from "math.gl";


export default class DebugTextureShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
this.addUniform("textureSize",new Vector2(100,100))
        this.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
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
      let uvPos = vec2<i32>(floor(uv0*uniforms.textureSize.xy));
     let color=textureLoad(colorTexture,  uvPos ,0).xyz; ;
     return vec4(color,1.0) ;
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}

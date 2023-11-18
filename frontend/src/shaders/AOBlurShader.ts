import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import {Vector2} from "math.gl";
import DefaultTextures from "../lib/textures/DefaultTextures";

export default class AOBlurShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("textureSize",new Vector2(100,100))
        this.addSampler("mySampler");
        this.addTexture("aoTexture",DefaultTextures.getWhite(this.renderer))
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
       let textureSize =vec2<f32>( textureDimensions(aoTexture));
  
     let pixelSize = 1.0/textureSize *1.5;
     var color= textureSample(aoTexture, mySampler, uv0).x ;
     
     color+= textureSample(aoTexture, mySampler, uv0+pixelSize*vec2(1.0,0)).x*0.75 ;
     color+= textureSample(aoTexture, mySampler, uv0+pixelSize*vec2(-1.0,0.0)).x*0.75  ;
     color+= textureSample(aoTexture, mySampler, uv0+pixelSize*vec2(0.0,-1.0)).x*0.75  ;
     color+= textureSample(aoTexture, mySampler, uv0+pixelSize*vec2(0.0,1.0)).x*0.75  ;
     
     
   
     
     color+= textureSample(aoTexture, mySampler, uv0+pixelSize*vec2(1.0,1.0)).x*0.5 ;
     color+= textureSample(aoTexture, mySampler, uv0+pixelSize*vec2(-1.0,-1.0)).x*0.5 ;
     color+= textureSample(aoTexture, mySampler, uv0+pixelSize*vec2(1.0,-1.0)).x*0.5 ;
     color+= textureSample(aoTexture, mySampler, uv0+pixelSize*vec2(-1.0,1.0)).x*0.5 ;
     
     
     
     color/=6;
     
     
     return vec4(color,1.0,1.0,1.0) ;
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

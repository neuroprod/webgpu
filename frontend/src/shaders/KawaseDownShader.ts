import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";

import {Vector2} from "math.gl";


export default class KawaseDownShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("textureSize", new Vector2(1, 100))
        this.addTexture("inputTexture", DefaultTextures.getWhite(this.renderer), "float");
        this.addSampler("mySampler")


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
       let textureSize =vec2<f32>( textureDimensions(inputTexture));
       let halfPixel =0.5/textureSize;
     var color =textureSample(inputTexture, mySampler,uv0)*4.0;
     color +=textureSample(inputTexture, mySampler,uv0+halfPixel*vec2f(1.0,1.0));
       color +=textureSample(inputTexture, mySampler,uv0+halfPixel*vec2f(-1.0,-1.0));
       color +=textureSample(inputTexture, mySampler,uv0+halfPixel*vec2f(-1.0,1.0));
       color +=textureSample(inputTexture, mySampler,uv0+halfPixel*vec2f(1.0,-1.0));
       color/=8.0;
       
       return vec4(color.xyz,1.0) ;
}
///////////////////////////////////////////////////////////
     
        `
    }


}

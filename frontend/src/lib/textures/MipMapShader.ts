import Shader from "../core/Shader";
import {ShaderType} from "../core/ShaderTypes";
import DefaultTextures from "./DefaultTextures";


export default class MipMapShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }

        this.addTexture("inputTexture", DefaultTextures.getWhite(this.renderer), "float");
        this.addSampler("samp")


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
       return textureSampleLevel(inputTexture, samp,uv0,0.0);
}
///////////////////////////////////////////////////////////
     
        `
    }


}

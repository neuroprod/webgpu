import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import DefaultTextures from "../lib/textures/DefaultTextures";

export default class DepthShaderAlpha extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }

        this.addTexture("opTexture", DefaultTextures.getWhite(this.renderer))
        this.addSampler("mySampler", GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX)
        this.needsTransform = true;
        this.needsCamera = true;

    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
   @location(0) uv0 : vec2f,
    @location(1) model : vec3f,
    @builtin(position) position : vec4f
  
}


${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.model =( model.modelMatrix *vec4( aPos,1.0)).xyz;
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
    output.uv0 =aUV0;

    return output;
}
@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) model: vec3f)  -> @location(0) vec4f
{

    let a= textureSample(opTexture, mySampler,  uv0).x;
    if(a<0.5){discard;}

  return vec4(distance(model,camera.worldPosition.xyz),0.0,0.0,1.0);
 
}

        
        
        
        
        
        
        
        
        `
    }


}

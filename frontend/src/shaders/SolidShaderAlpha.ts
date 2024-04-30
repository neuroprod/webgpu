import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import DefaultTextures from "../lib/textures/DefaultTextures";


export default class SolidShaderAlpha extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("alphaClipValue", 0);

        this.addTexture("opTexture", DefaultTextures.getWhite(this.renderer))
        this.addTexture("gDepth", DefaultTextures.getDepth(this.renderer), "unfilterable-float")
        this.addSampler("mySampler", GPUShaderStage.FRAGMENT, "repeat")
        this.needsTransform = true;
        this.needsCamera = true;
    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{

     @location(0) projPos : vec4f,
       @location(1) uv1 : vec2f,
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
    output.projPos =output.position;
    output.uv1 = aUV0;
    return output;
}


@fragment
fn mainFragment(@location(0) projPos: vec4f,@location(1) uv1: vec2f) ->   @location(0) vec4f
{
    let a= textureSample(opTexture, mySampler,  uv1).x;
    if(a<uniforms.alphaClipValue){discard;}
    var uv0 = (projPos.xy/projPos.w)*0.5+0.5;
    uv0.y =1.0-uv0.y;
    let textureSize =vec2<f32>( textureDimensions(gDepth));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
    let d =textureLoad(gDepth,  uvPos ,0).x;
    var y=1.0;
    if(d+0.002>projPos.z/projPos.w){
    y=0.0;
    }

  return vec4f(1.0,y,0.0,0.0);
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

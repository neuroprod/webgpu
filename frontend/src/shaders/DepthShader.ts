import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector4} from "math.gl";
import {TextureDimension} from "../lib/WebGPUConstants";

export default class DepthShader extends Shader {
    private alphaClipValue: number = 0;
    private needsAlphaClip: boolean = false;
    private needsWind: boolean = false;
    private windData: Vector4 = new Vector4(0, 1, 0.5, 0.2)


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        if (this.needsWind) {
            this.addUniform("windData", this.windData)
            this.addUniform("time", 0);

            this.addTexture("noiseTexture", this.renderer.texturesByLabel["noiseTexture.png"], "float", TextureDimension.TwoD, GPUShaderStage.VERTEX)

        }
        if (this.needsAlphaClip) {
            this.addUniform("alphaClipValue", this.alphaClipValue);
            this.addTexture("opTexture", DefaultTextures.getWhite(this.renderer))
            this.addSampler("mySampler", GPUShaderStage.FRAGMENT, "repeat")
        }


        this.needsTransform = true;
        this.needsCamera = true;

    }

    setMaterialData(md: any) {
        if (md.needsAlphaClip) {
            this.needsAlphaClip = true;
            this.alphaClipValue = md.alphaClipValue;

        }
        if (md.needsWind) {
            this.needsWind = true;
            this.windData = new Vector4(md.windData[0], md.windData[1], md.windData[2], md.windData[3])
        }
    }

    private getWindChunk() {
        if (!this.needsWind) return "";
        return `
        let uvH =vec2<i32>(floor(world.xz*100.0+vec2(uniforms.time*40.0)))%512;
          let t = (textureLoad( noiseTexture,uvH,0).xyz-vec3(0.5))*vec3(1.0,uniforms.windData.w,1.0);
          
       
        
        
          let noiseVal =smoothstep(uniforms.windData.x,uniforms.windData.y,pos.y);
        world=world+vec4(t*noiseVal*uniforms.windData.z,0.0);
        `
    }

    private getAlphaClipChunk() {
        if (!this.needsAlphaClip) return "";

        return `let a= textureSample(opTexture, mySampler,  uv0).x;
        if(a<uniforms.alphaClipValue){discard;}`
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
    
       let pos = vec4( aPos,1.0);
    var world=model.modelMatrix *pos;
    ${this.getWindChunk()} 
    
    output.position =camera.viewProjectionMatrix*world;
    
    output.model =world.xyz;

  output.uv0 =aUV0;

    return output;
}
@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) model: vec3f)  -> @location(0) vec4f
{
  ${this.getAlphaClipChunk()} 
 

  return vec4(distance(model,camera.worldPosition.xyz),0.0,0.0,1.0);
 
}

        
        
        
        
        
        
        
        
        `
    }


}

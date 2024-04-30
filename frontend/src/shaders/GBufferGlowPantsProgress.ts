import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {TextureDimension} from "../lib/WebGPUConstants";
import {Vector4} from "math.gl";

export default class GBufferGlowPantsProgress extends Shader {
    private needsAlphaClip: boolean = false;
    private alphaClipValue: number = 0;
    private needsWind: boolean = false;

    private windData: Vector4 = new Vector4(0, 1, 0.5, 0.2)
    private normalAdj: number = 0;

    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aTangent", ShaderType.vec4);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        if (this.needsWind) {
            this.addUniform("windData", this.windData)
            this.addUniform("time", 0);

            this.addTexture("noiseTexture", this.renderer.texturesByLabel["noiseTexture.png"], "float", TextureDimension.TwoD, GPUShaderStage.VERTEX)

        }

        this.addUniform("normalAdj", this.normalAdj);
        this.addUniform("progress", 0.5);
        if (this.needsAlphaClip) {
            this.addUniform("alphaClipValue", this.alphaClipValue);
            this.addTexture("opTexture", DefaultTextures.getWhite(this.renderer))
        }
        this.addTexture("progressTexture", this.renderer.texturesByLabel["glowPantsProgress.png"]);
        this.addTexture("colorTexture", DefaultTextures.getWhite(this.renderer))
        this.addTexture("mraTexture", DefaultTextures.getMRE(this.renderer))
        this.addTexture("normalTexture", DefaultTextures.getNormal(this.renderer))
        this.addSampler("mySampler", GPUShaderStage.FRAGMENT, "repeat")

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
        this.normalAdj = md.normalAdj;
    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
   @location(0) uv0 : vec2f,
    @location(1) normal : vec3f,
    @location(2) tangent : vec3f,
    @location(3) biTangent : vec3f,
  
    @builtin(position) position : vec4f
  
}
struct GBufferOutput {
  @location(0) color : vec4f,
  @location(1) normal : vec4f,
    @location(2) mra : vec4f,
   
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
    output.uv0 =aUV0;

    output.normal =model.normalMatrix *aNormal;
    output.tangent =model.normalMatrix*aTangent.xyz;
     output.biTangent =model.normalMatrix* (normalize(cross( normalize(aTangent.xyz), normalize(aNormal)))*aTangent.w);
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f,@location(2) tangent: vec3f,@location(3) biTangent: vec3f) -> GBufferOutput
{
    var output : GBufferOutput;
  ${this.getAlphaClipChunk()} 
   
    let p =textureSample(progressTexture, mySampler,  uv0).x;
    let prog =1.0-smoothstep(uniforms.progress-0.1,uniforms.progress,1.0-p);
    output.color = mix(textureSample(colorTexture, mySampler,  uv0),vec4(0.0,1.0,0.0,1.0),prog);
 
  
 
    var normalText = textureSample(normalTexture, mySampler,  uv0).xyz* 2. - 1.;
    
    var N = mat3x3f(normalize(tangent),normalize(biTangent),normalize(normal))*normalize(normalText);
    N.y+=uniforms.normalAdj;
    output.normal =vec4(normalize(N)*0.5+0.5,1.0);
    
  
   
    output.mra =textureSample(mraTexture, mySampler,  uv0) ;
 output.mra.z =prog*0.7;

  return output;
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }

    private getAlphaClipChunk() {
        if (!this.needsAlphaClip) return "";

        return `let a= textureSample(opTexture, mySampler,  uv0).x;
        if(a<uniforms.alphaClipValue){discard;}`
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


}

import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {TextureDimension} from "../lib/WebGPUConstants";
import {Vector4} from "math.gl";

export default class GBufferShaderLeaves extends Shader {
    private needsAlphaClip: boolean = true;
    private alphaClipValue: number = 0.2;
    private needsWind: boolean = false;

    private windData: Vector4 = new Vector4(0, 1, 0.5, 0.2)
    private normalAdj: number = 0;

    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);

            this.addAttribute("aUV0", ShaderType.vec2);
            this.addAttribute("instancePos", ShaderType.vec4, 1, "instance");
            this.addAttribute("instanceRot", ShaderType.vec4, 1, "instance");
        }

        this.addUniform("time", 0);

        this.addTexture("noiseTexture", this.renderer.texturesByLabel["noiseTexture.png"], "float", TextureDimension.TwoD, GPUShaderStage.VERTEX)


        if (this.needsAlphaClip) {
            this.addUniform("alphaClipValue", this.alphaClipValue);
            this.addTexture("opTexture", this.renderer.texturesByLabel["leaveAlpha.png"])
        }

        this.addTexture("colorTexture", this.renderer.texturesByLabel["leaveColor.png"])
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


fn rotation3d(axis:vec3f,  angle:f32)-> mat4x4<f32> {
 
  let s = sin(angle);
  let c = cos(angle);
  let oc = 1.0 - c;

  return mat4x4<f32>(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                                0.0,                                0.0,                                1.0
  );
}


@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var insPos =instancePos.xyz;
    insPos.y+=uniforms.time*instancePos.w;
    insPos.y =-insPos.y%6.0+6.0;
    insPos.x += (insPos.y-6.0)*0.3;
    
     let uvH =vec2<i32>(floor(insPos.xz*100.0+vec2(uniforms.time*40.0)))%512;
          let wind = (textureLoad( noiseTexture,uvH,0).xyz-vec3(0.5))*vec3(1.0,1.0,1.0)*2.0;
          
       insPos-=wind;
        
        
         
    
    
    
    
    
    
    
    let rM =rotation3d(instanceRot.xyz,uniforms.time*instancePos.w*5.0);
    
    
    var pos =rM* vec4( aPos*instanceRot.w,1.0);
    pos+=vec4(insPos,0.0);

    var world=model.modelMatrix *pos;
  
    
    output.position =camera.viewProjectionMatrix*world;
    output.uv0 =aUV0;

    output.normal =model.normalMatrix *aNormal;
   
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f) -> GBufferOutput
{
    var output : GBufferOutput;
  ${this.getAlphaClipChunk()} 
   

    output.color = textureSample(colorTexture, mySampler,  uv0);
 
  
 
    var normalText = textureSample(normalTexture, mySampler,  uv0).xyz* 2. - 1.;
    
    var N = normalize(normal);
  
    output.normal =vec4(normalize(N)*0.5+0.5,1.0);
    
  
   
    output.mra =textureSample(mraTexture, mySampler,  uv0) ;
 

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


}

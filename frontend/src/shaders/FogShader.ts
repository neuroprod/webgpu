import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {fresnelSchlickRoughness, getWorldFromUVDepth, ssr} from "./ShaderChunks";
import {Vector4} from "math.gl";
import {AddressMode} from "../lib/WebGPUConstants";

export default class FogShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);

            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("time", 0);

        this.addTexture("gDepth",this.renderer.texturesByLabel["GDepth"],"unfilterable-float");
        this.addTexture("fog",this.renderer.texturesByLabel["fog.png"],"float");
        this.addTexture("noise",this.renderer.texturesByLabel["noiseTexture.png"],"float");
        this.addSampler("mySampler",GPUShaderStage.FRAGMENT,AddressMode.MirrorRepeat);

        this.needsTransform =true;
        this.needsCamera=true;

    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
   @location(0) uv0 : vec2f,
    @location(1) normal : vec3f,
 

     @location(2) world : vec3f,
     @location(3) projPos : vec4f,
    @builtin(position) position : vec4f
  
}


${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}
${getWorldFromUVDepth()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
    output.uv0 =aUV0;
    output.projPos =output.position;
    output.world =(model.modelMatrix *vec4( aPos,1.0)).xyz;
    output.normal =model.normalMatrix *aNormal;
   
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f,@location(2) world: vec3f,@location(3) projPos: vec4f) -> @location(0) vec4f
{
    let textureSize =vec2<f32>( textureDimensions(gDepth));
    var uvScreen = (projPos.xy/projPos.w)*0.5+0.5;
    uvScreen.y =1.0-uvScreen.y;

    let uvScreenI = vec2<i32>(floor(uvScreen  *textureSize));
    let depth =textureLoad(gDepth,  uvScreenI ,0).x; 
    let worldL=getWorldFromUVDepth(uv0 ,depth); 
    let d =world.z -worldL.z;
    
   var uvFog  = uv0;
   uvFog.x +=uniforms.time*0.7;
     var uvNoise  = uv0;
   uvNoise.x -=uniforms.time*0.5;
   uvNoise.y +=uniforms.time*0.25;
   uvNoise.x*=2.3;
    var noise =(textureSample(noise, mySampler,   uvNoise).xy)*0.15;
    var alpha =(textureSample(fog, mySampler,   uvFog+noise).x);
  

 alpha *=smoothstep(0.0,1.0,d);

alpha*=smoothstep(0.0,0.2,uv0.x)*smoothstep(0.0,0.2,1.0-uv0.x)*0.5;
  return vec4(vec3(alpha),alpha);
 
}
///////////////////////////////////////////////////////////
              
        `
    }



}

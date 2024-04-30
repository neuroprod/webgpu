import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {fresnelSchlickRoughness, getWorldFromUVDepth, ssr} from "./ShaderChunks";
import {Vector4} from "math.gl";

export default class WaterFrontShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aTangent", ShaderType.vec4);
            this.addAttribute("aUV0", ShaderType.vec2);

        }


        this.addUniform("refSettings1", new Vector4());
        this.addUniform("refSettings2", new Vector4());
        this.addUniform("time", 0);
        this.addUniform("dayNight", 0);

        this.addTexture("gDepth", DefaultTextures.getWhite(this.renderer), "unfilterable-float");
        this.addTexture("reflectTexture", DefaultTextures.getWhite(this.renderer), "float");
        this.addTexture("noise", this.renderer.texturesByLabel["noiseTexture.png"], "float");

        this.addSampler("mySampler", GPUShaderStage.FRAGMENT, "mirror-repeat");

        this.needsTransform = true;
        this.needsCamera = true;

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
     @location(4) world : vec3f,
     @location(5) projPos : vec4f,
    @builtin(position) position : vec4f
  
}


${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}
${getWorldFromUVDepth()}
${fresnelSchlickRoughness()}
${ssr()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
    output.uv0 =aUV0;
    output.projPos =output.position;
    output.world =(model.modelMatrix *vec4( aPos,1.0)).xyz;
    output.normal =model.normalMatrix *aNormal;
    output.tangent =model.normalMatrix*aTangent.xyz;
    output.biTangent =model.normalMatrix* (normalize(cross( normalize(aTangent.xyz), normalize(aNormal)))*aTangent.w);
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f,@location(2) tangent: vec3f,@location(3) biTangent: vec3f,@location(4) world: vec3f,  @location(5) projPos : vec4f) -> @location(0) vec4f
{
    let textureSize =vec2<f32>( textureDimensions(gDepth));
    var uvScreen = (projPos.xy/projPos.w)*0.5+0.5;
    uvScreen.y =1.0-uvScreen.y;
     let uv =uv0+vec2(uniforms.time*0.05,0.0)*3.0;
  uvScreen +=(textureSample(noise,   mySampler, uv).xy-vec2(0.5))*0.007;
    let uvScreenI = vec2<i32>(floor(uvScreen  *textureSize));
    let worldS =getWorldFromUVDepth(uvScreen ,textureLoad(gDepth,  uvScreenI ,0).x); 
 
  
    let dist =distance(worldS,world);
  let V = normalize(camera.worldPosition.xyz - world);
    let dir =refract(-V,-normal,0.5);
    let sPos =world+dir*0.02*dist;
    let pPos =camera.viewProjectionMatrix*vec4(sPos,1.0);
    var uvRef = (pPos.xy/pPos.w)*0.5+0.5;
    uvRef.y = 1.0-uvRef.y;

    var refractColor = textureSampleLevel(reflectTexture,   mySampler,   uvScreen,dist*dist).xyz;
 let fog = mix(vec3(0.0,0.5,0.5),vec3(0.0),uniforms.dayNight);
 
 refractColor =mix(refractColor,fog,smoothstep(0.0,2.0,dist)+0.1);
   refractColor*=1.0-(uniforms.dayNight*0.5);
   let result = refractColor;
 //return vec4( textureSample(noise,   mySampler, uv).xyz*0.1,1.0);
  return vec4( result,1.0);
 
}
///////////////////////////////////////////////////////////
              
        `
    }


}

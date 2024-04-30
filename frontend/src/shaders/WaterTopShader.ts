import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {fresnelSchlickRoughness, getWorldFromUVDepth, simplex3D, ssr} from "./ShaderChunks";
import {Vector4} from "math.gl";
import {AddressMode} from "../lib/WebGPUConstants";

export default class WaterTopShader extends Shader {


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
        this.addTexture("lut", this.renderer.texturesByLabel["brdf_lut.png"], "unfilterable-float")
        this.addTexture("gDepth", DefaultTextures.getWhite(this.renderer), "unfilterable-float");
        this.addTexture("reflectTexture", DefaultTextures.getWhite(this.renderer), "float");
        this.addTexture("noise", this.renderer.texturesByLabel["noiseTexture.png"], "float");

        this.addTexture("colorTexture", DefaultTextures.getWhite(this.renderer));
        this.addTexture("mraTexture", DefaultTextures.getWhite(this.renderer));
        this.addTexture("normalTexture", this.renderer.texturesByLabel["WaterNormal.jpg"]);
        this.addSampler("mySampler", GPUShaderStage.FRAGMENT, AddressMode.Repeat);

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
${simplex3D()}
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

    let uvScreenI = vec2<i32>(floor(uvScreen  *textureSize));
    let worldS =getWorldFromUVDepth(uvScreen ,textureLoad(gDepth,  uvScreenI ,0).x); 
 
    
    let albedo =pow( textureSample(colorTexture, mySampler,  uv0).xyz,vec3(2.2));
 let uvWater1 = uv0+vec2f(uniforms.time*0.3,uniforms.time*0.3);
    var normalText1 = textureSample(normalTexture, mySampler,  uvWater1).xyz* 2. - 1.;
     normalText1*=vec3(0.5,0.5,1.0);
     let uvWater2 = uv0+vec2f(-uniforms.time*0.3,-uniforms.time*0.3);
    var normalText2 = textureSample(normalTexture, mySampler,  uvWater2).xyz* 2. - 1.;
    normalText2*=vec3(0.5,0.5,1.0);
    let N =mat3x3f(normalize(tangent),normalize(biTangent),normalize(normal))*normalize(normalText1+normalText2);
  //  let mra =textureSample(mraTexture, mySampler,  uv0) ;
    let roughness =0.01;//mra.y+0.01;
    let metallic = 0.5;

    let V = normalize(camera.worldPosition.xyz - world);
    let dir =refract(-V,-N,0.9);
    
    let dist =distance(worldS,world);

    let sPos =world+dir*0.02*dist;
    let pPos =camera.viewProjectionMatrix*vec4(sPos,1.0);
    var uvRef = (pPos.xy/pPos.w)*0.5+0.5;
    uvRef.y = 1.0-uvRef.y;
 let fog = mix(vec3(0.0,0.5,0.5),vec3(0.0),uniforms.dayNight);
    var refractColor = textureSampleLevel(reflectTexture,   mySampler, uvRef,dist).xyz;
 refractColor =mix(refractColor,fog,smoothstep(0.0,2.0,dist));
    let NdotV =max(dot(N, V), 0.0);
    let F0 = mix(vec3(0.02), albedo, metallic);
    let F =fresnelSchlickRoughness(NdotV, F0,roughness);
    let envUV = vec2<i32>(floor(vec2f(NdotV*400.0, roughness*400.0)));
    let envBRDF = textureLoad(lut,envUV,0).xy;
    let refValue =pow((F * envBRDF.x + envBRDF.y),vec3f(1.0)) ;

 
    let reflectColor = ssr(world,-N,V,metallic,roughness,textureSize)*1.0;
   var result = mix(refractColor,reflectColor,refValue);

let foam = mix(vec3(1.0,1.0,0.8),vec3(0.05,0.05,0.1),uniforms.dayNight);

var f = clamp(smoothstep(0.0,0.14 ,dist)-(1.0-smoothstep(0.1,0.2 ,uv0.x)),0.0,1.0);
 f+=snoise3d(vec3f(uv0.xy*50.0,uniforms.time*10.0))*0.25 +0.25;
f = smoothstep(0.1,1.0,f);
  result =mix(foam,result,f);
  return vec4( result,1.0);
 
}
///////////////////////////////////////////////////////////
              
        `
    }


}

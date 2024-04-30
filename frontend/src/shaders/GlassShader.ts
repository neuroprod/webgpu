import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {fresnelSchlickRoughness, getWorldFromUVDepth, ssr} from "./ShaderChunks";
import {Vector4} from "math.gl";

export default class GlassShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aTangent", ShaderType.vec4);
            this.addAttribute("aUV0", ShaderType.vec2);

        }

        this.addUniform("refSettings1", new Vector4(1, 0, 0.01, 1.4));
        this.addUniform("refSettings2", new Vector4(20, 10, 1, 0));
        this.addTexture("lut", this.renderer.texturesByLabel["brdf_lut.png"], "unfilterable-float")
        this.addTexture("gDepth", DefaultTextures.getWhite(this.renderer), "unfilterable-float");
        this.addTexture("reflectTexture", DefaultTextures.getWhite(this.renderer), "float");

        this.addTexture("colorTexture", DefaultTextures.getWhite(this.renderer));
        this.addTexture("mraTexture", DefaultTextures.getWhite(this.renderer));
        this.addTexture("normalTexture", DefaultTextures.getNormal(this.renderer));
        this.addSampler("mySampler");

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

    let uvScreenI = vec2<i32>(floor(uvScreen  *textureSize));
    let worldS =getWorldFromUVDepth(uvScreen ,textureLoad(gDepth,  uvScreenI ,0).x); 
 
    
    let albedo =pow( textureSample(colorTexture, mySampler,  uv0).xyz,vec3(2.2));
 
    var normalText = textureSample(normalTexture, mySampler,  uv0).xyz* 2. - 1.;
    let N = mat3x3f(normalize(tangent),normalize(biTangent),normalize(normal))*normalize(normalText);
    let mra =textureSample(mraTexture, mySampler,  uv0) ;
    let roughness =0.5;//mra.y+0.01;
    let metallic = mra.x;

    let V = normalize(camera.worldPosition.xyz - world);
    let dir =refract(-V,-N,0.95);
    
    let dist =distance(worldS,world);

    let sPos =world+dir*0.02*dist;
    let pPos =camera.viewProjectionMatrix*vec4(sPos,1.0);
    var uvRef = (pPos.xy/pPos.w)*0.5+0.5;
    uvRef.y = 1.0-uvRef.y;

    var refractColor = textureSample(reflectTexture,   mySampler, uvRef).xyz;
    refractColor =mix(albedo,refractColor,0.5);
    let NdotV =max(dot(N, V), 0.0);
    let F0 = mix(vec3(0.02), albedo, metallic);
    let F =fresnelSchlickRoughness(NdotV, F0,roughness);
    let envUV = vec2<i32>(floor(vec2f(NdotV*400.0, roughness*400.0)));
    let envBRDF = textureLoad(lut,envUV,0).xy;
    let refValue =pow((F * envBRDF.x + envBRDF.y),vec3f(1.0)) ;

 
    let reflectColor = ssr(world,-N,V,metallic,roughness,textureSize)*5.0;
   let result = mix(refractColor,reflectColor,refValue);
 
  return vec4(result,1.0);
 
}
///////////////////////////////////////////////////////////
              
        `
    }


}

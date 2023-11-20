import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {getWorldFromUVDepth} from "./ShaderChunks";

export default class GlassShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aTangent",ShaderType.vec4);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("scale",1);
        this.addTexture("gDepth",DefaultTextures.getWhite(this.renderer),"unfilterable-float");
        this.addTexture("background",DefaultTextures.getWhite(this.renderer),"unfilterable-float");
        this.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer));
        this.addTexture("mraTexture",DefaultTextures.getWhite(this.renderer));
        this.addTexture("normalTexture",DefaultTextures.getNormal(this.renderer));
        this.addSampler("mySampler");

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
 
    
    let albedo = textureSample(colorTexture, mySampler,  uv0).xyz;
 
    var normalText = textureSample(normalTexture, mySampler,  uv0).xyz* 2. - 1.;
    let N = mat3x3f(normalize(tangent),normalize(biTangent),normalize(normal))*normalize(normalText);
    let mra =textureSample(mraTexture, mySampler,  uv0) ;
 

    let V = -normalize(camera.worldPosition.xyz - world);
    let dir =refract(V,-N,0.95);
    
    let dist =distance(worldS,world);

    let sPos =world+dir*0.02*dist;
    let pPos =camera.viewProjectionMatrix*vec4(sPos,1.0);
    let uvRef = (pPos.xy/pPos.w)*0.5+0.5;
  
    let uvRefI = vec2<i32>(floor(vec2(uvRef.x,1.0-uvRef.y  )*textureSize));

    var refColor = textureLoad(background,  uvRefI ,0).xyz;
 
 
 refColor+=vec3(0.03,0.06,0.03);
 
  return vec4(refColor,1.0);
 
}
///////////////////////////////////////////////////////////
              
        `
    }



}

import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector4} from "math.gl";
import {getWorldFromUVDepth} from "./ShaderChunks";
import Camera from "../lib/Camera";
import {TextureViewDimension} from "../lib/WebGPUConstants";



export default class GlobalLightShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }

        this.addUniform("lightPos",new Vector4(1,0.7,0.7,0.1))
        this.addUniform("lightColor",new Vector4(1,0.7,0.7,0.1))
        this.addUniform("topColor",new Vector4(1,0.7,0.7,0.1))
        this.addUniform("midColor",new Vector4(1,1,1,0.05))
        this.addUniform("bottomColor",new Vector4(1,1,1,0.02))
        this.addTexture("shadowCube",DefaultTextures.getCube(this.renderer),"depth",TextureViewDimension.Cube)
        this.addTexture("gDepth",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gColor",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gNormal",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gMRA",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("aoTexture",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addSamplerComparison("mySampler");
        this.needsCamera =true;
        this.logShaderCode =true;

    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) uv0 : vec2f,
 
    @builtin(position) position : vec4f
  
}



${Camera.getShaderText(0)}
${this.getShaderUniforms(1)}
${getWorldFromUVDepth()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
 
    
    output.position =vec4( aPos,1.0);
    
  
    output.uv0 =aUV0;
   
    return output;
}


@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{




    let textureSize =vec2<f32>( textureDimensions(gColor));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
    

    let world=getWorldFromUVDepth(uv0 ,textureLoad(gDepth,  uvPos ,0).x); 
    
    
    let dir = world-uniforms.lightPos.xyz;
    
    let distToLight=distance (uniforms.lightPos.xyz,world);
    let near =1.0;
    let far =10.0;
    
 
    let dd= ((far+near)/(far-near)) + (1.0/distToLight)*((-2.0*far*near)/(far-near));
 
     let albedo =pow(textureLoad(gColor,  uvPos ,0).xyz,vec3(2.2));;
    let shadow = textureSampleCompare(shadowCube, mySampler,normalize(dir), dd+0.001);
   //return vec4(vec3(shadow*albedo ),1.0) ;    
    
    

    let N = (textureLoad(gNormal,  uvPos ,0).xyz-0.5) *2.0;
    let mra =textureLoad(gMRA,  uvPos ,0).xyz ;
      
      
    let textureSizeAO =vec2<f32>( textureDimensions(aoTexture));
    let uvPosAO = vec2<i32>(floor(uv0*textureSizeAO));
      
    let ao = textureLoad(aoTexture,  uvPosAO ,0).x ;
    let l = dot(N,vec3(0,1.0,0));
    let light =mix( mix(uniforms.midColor.xyz*uniforms.midColor.w,uniforms.topColor.xyz*uniforms.topColor.w,max(0.0,l)),uniforms.bottomColor.xyz*uniforms.bottomColor.w,max(0.0,-l));
      
      
   let color = albedo*light*ao*(1.0-mra.x) +albedo*pow(mra.z,2.0)*10.0;

    return vec4(color,1.0) ;
}
///////////////////////////////////////////////////////////
        `
    }



}

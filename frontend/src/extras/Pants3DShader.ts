import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {simplex3D} from "../shaders/ShaderChunks";

export default class Pants3DShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aColor", ShaderType.vec3);
            this.addAttribute("aCenter", ShaderType.vec3);
            //   this.addAttribute("aNormal", ShaderType.vec3);
            //  this.addAttribute("aTangent", ShaderType.vec4);
            // this.addAttribute("aUV0", ShaderType.vec2);

        }


        this.addUniform("baseTriangle", 0);
        this.addUniform("time", 0);
        this.addUniform("lineThickness", 0);
        this.addUniform("inScale", 0);
        this.addUniform("outScale", 0);
        this.addTexture("colorTexture", DefaultTextures.getWhite(this.renderer))
        this.addTexture("mraTexture", DefaultTextures.getMRE(this.renderer))
        this.addTexture("normalTexture", DefaultTextures.getNormal(this.renderer))
        this.addSampler("mySampler", GPUShaderStage.FRAGMENT, "repeat")

        this.needsTransform = true;
        this.needsCamera = true;
    }


    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) color : vec3f,
  // @location(0) uv0 : vec2f,
   // @location(1) normal : vec3f,
    //@location(2) tangent : vec3f,
    //@location(3) biTangent : vec3f,
  
    @builtin(position) position : vec4f
  
}


${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}
${simplex3D()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var  pos = vec4( aPos+vec3(0.01,0.0,0.06),1.0);
    
    
    if(length(aCenter)<0.001){
        if(pos.x<0.0){
            pos = mix(pos,vec4(sin(0.0)*0.2,cos(0.0)*0.2,0.0,1.0),uniforms.baseTriangle);
        }else if(pos.y>0)
        {
            pos = mix(pos,vec4(sin(2.0943)*0.2,cos(2.0943)*0.2,0.0,1.0),uniforms.baseTriangle);
        }
        else{
         pos = mix(pos,vec4(sin(4.1886)*0.2,cos(4.1886)*0.2,0.0,1.0),uniforms.baseTriangle);
        
        }
    
    
    }

    else{
    pos.x+= snoise3d(vec3(aCenter.yz*uniforms.inScale,uniforms.time))*uniforms.outScale;
    pos.y+= snoise3d(vec3(aCenter.xz*uniforms.inScale,uniforms.time))*uniforms.outScale;
    pos.z+= snoise3d(vec3(aCenter.xy*uniforms.inScale,uniforms.time))*uniforms.outScale;
    pos  = mix(pos,vec4(aCenter,1.0),uniforms.baseTriangle);
  
    }
    
 
    
    var world=model.modelMatrix *pos;
    output.position =camera.viewProjectionMatrix*world;
     output.color =aColor;
   // output.uv0 =aUV0;

    //output.normal =model.normalMatrix *aNormal;
    //output.tangent =model.normalMatrix*aTangent.xyz;
     //output.biTangent =model.normalMatrix* (normalize(cross( normalize(aTangent.xyz), normalize(aNormal)))*aTangent.w);
    return output;
}

fn  edgeFactor(color: vec3f)->f32 {
  let d = fwidth(color);
  let f = smoothstep(d *(uniforms.lineThickness-0.1),d *uniforms.lineThickness, color);
  return min(min(f.x, f.y), f.z);
}
@fragment
fn mainFragment(@location(0) color: vec3f) -> @location(0) vec4f
{


   let edge = 1.0-edgeFactor(color);

   
 

  return vec4(vec3(edge*5.0),edge);
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

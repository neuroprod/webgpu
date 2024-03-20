import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class Pants3DEndShader extends Shader {



    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aColor", ShaderType.vec3);
            this.addAttribute("aCenter", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aTangent", ShaderType.vec4);
            this.addAttribute("aUV0", ShaderType.vec2);

        }



        this.addUniform("lineThickness", 0);

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
   @location(1) uv0 : vec2f,
    @location(2) normal : vec3f,
    @location(3) tangent : vec3f,
    @location(4) biTangent : vec3f,
   @location(5) world : vec3f,
    @builtin(position) position : vec4f
  
}


${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var  pos = vec4( aPos+vec3(0.01,0.0,0.06),1.0);
    
    
    
    var world=model.modelMatrix *pos;
    output.position =camera.viewProjectionMatrix*world;
     output.color =aColor;
   output.uv0 =aUV0;
output.world = world.xyz;
    output.normal =model.normalMatrix*aNormal;
    output.tangent =model.normalMatrix*aTangent.xyz;
     output.biTangent =model.normalMatrix* (normalize(cross( normalize(aTangent.xyz), normalize(aNormal)))*aTangent.w);
    return output;
}

fn  edgeFactor(color: vec3f)->f32 {
  let d = fwidth(color);
  let f = smoothstep(d *(uniforms.lineThickness-0.1),d *uniforms.lineThickness, color);
  return min(min(f.x, f.y), f.z);
}
@fragment
fn mainFragment(@location(0) color: vec3f,@location(1) uv0: vec2f,@location(2) normal: vec3f,@location(3) tangent: vec3f,@location(4) biTangent: vec3f,@location(5) world: vec3f) -> @location(0) vec4f
{
    let N = mat3x3f(normalize(tangent),normalize(biTangent),normalize(normal))*vec3(0.0,0.0,1.0);
    let outColor =clamp( normalize(normal)*0.5 +vec3(0.5),vec3(0.0),vec3(1.0));
  
  
   let edge = 1.0-edgeFactor(color);

   let alpha =edge + (1.0-uniforms.lineThickness);
 let colorR = mix(vec3(5.0),outColor,1.0-uniforms.lineThickness) ;

  return vec4( colorR*alpha,alpha);
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}

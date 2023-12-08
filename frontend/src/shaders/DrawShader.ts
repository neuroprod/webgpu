import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {Vector4} from "math.gl";

export default class DrawShader extends Shader{
    public numInstances: number=0;


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);
            this.addAttribute("instanceData", ShaderType.vec4,1,"instance");
        }
       this.addUniform("color",new Vector4(1,1,1,1))
        // this.addVertexOutput("normal",3);
        // this.addVertexOutput("uv0",2);
        this.needsTransform =true;
        this.needsCamera=true;
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
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}




@vertex
fn mainVertex( @builtin(instance_index) instanceIdx : u32,${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var pos =aPos; 
    let instance = instanceData;
    pos*=vec3f(instance.z,instance.z,1.0);
    pos+=vec3f(instance.x,instance.y,0.0);
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4(pos,1.0);
     output.uv0 =aUV0;
    return output;
}

@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{
        let uv =uv0-vec2f(0.5,0.5);
        let l  =1.0-saturate(smoothstep(0.8,1.0,length(uv)*2.0));
       let color = vec4(vec3(uniforms.color.xyz)*l ,l);
  return color;
     //return textureSample(brushTexture, mySampler,  uv0);
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}

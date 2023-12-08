import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class DrawShader extends Shader{
    public numInstances: number=0;


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
       this.addTexture("brushTexture",DefaultTextures.getWhite(this.renderer))
        this.addSampler("mySampler")
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


@group(3) @binding(0)  var<uniform> instanceData : array<vec4f,${this.numInstances}>;

@vertex
fn mainVertex( @builtin(instance_index) instanceIdx : u32,${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var pos =aPos; 
    let instance = instanceData[instanceIdx];
    pos*=vec3f(instance.z,instance.z,1.0);
    pos+=vec3f(instance.x,instance.y,0.0);
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4(pos,1.0);
     output.uv0 =aUV0;
    return output;
}

@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{

  
     return textureSample(brushTexture, mySampler,  uv0);
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}

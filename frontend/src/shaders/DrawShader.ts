import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {Vector4} from "math.gl";

export default class DrawShader extends Shader {
    public numInstances: number = 0;


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);
            this.addAttribute("instanceData", ShaderType.vec4, 1, "instance");
        }
        this.addUniform("color", new Vector4(1, 1, 1, 1))

        this.needsTransform = true;
        this.needsCamera = true;
    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
   @location(0) uv0 : vec2f,
    @builtin(position) position : vec4f 
}

struct GBufferOutput {
  @location(0) color : vec4f,
  @location(1) normal : vec4f,
    @location(2) mra : vec4f,
   
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
fn mainFragment(@location(0)  uv0: vec2f)  -> GBufferOutput
{
 var output : GBufferOutput;
        let uv =uv0-vec2f(0.5,0.5);
        let l  =length(uv)*2.0;
        if(l>1){discard;}
         output.mra = vec4(0.0,1.0,0.1,0.0);
       output.color = uniforms.color;
       
  output.normal =vec4(0.0,0.0,1.0,0.0);
    return output;
     //return textureSample(brushTexture, mySampler,  uv0);
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

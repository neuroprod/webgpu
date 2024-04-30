import Shader from "../core/Shader";
import {ShaderType} from "../core/ShaderTypes";
import Camera from "../Camera";
import ModelTransform from "../model/ModelTransform";
import {Vector4} from "math.gl";


export default class FontShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aTangent", ShaderType.vec4);

        }
        this.addUniform("fontEdge", new Vector4());
        this.addUniform("alpha", 1);
        this.addUniform("time", 0);
        this.addTexture("colorTexture", this.renderer.texturesByLabel["Font.png"]);

        this.addSampler("mySampler");

        this.needsTransform = true;
        this.needsCamera = true;

    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
   @location(0) uv0 : vec3f,
     @builtin(position) position : vec4f
  
}


${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var pos = aPos;
    pos.y +=sin((aTangent.w+uniforms.time*0.6)*10.0)*0.005*aTangent.z;
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4(pos,1.0);
    output.uv0 =aTangent.xyz;
   
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec3f) -> @location(0) vec4f
{
  
 
 
    let text = textureSample(colorTexture, mySampler,  uv0.xy).xyz;
    let dist = max(min(text.r, text.g), min(max(text.r, text.g), text.b));
    let l =min(smoothstep(uniforms.fontEdge.x,uniforms.fontEdge.y,dist)*uniforms.alpha+dist,1.0);
     let e =smoothstep(uniforms.fontEdge.z,uniforms.fontEdge.w,dist);
     let b = mix(vec3(1.0,1.0,1.0),vec3(0.90,0.8,0.5),uv0.z);
     let col =mix(vec3(0.07,0.03,0.00),b,e);
     
     //vec3(0.90,0.83,0.65)
    return vec4(col*l,l);
 
}
///////////////////////////////////////////////////////////
              
        `
    }


}

import Shader from "../lib/core/Shader";


import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class DepthSkinShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aWeights", ShaderType.vec4);
            this.addAttribute("aJoints", ShaderType.vec4i);

        }


        this.needsTransform = true;
        this.needsCamera = true;

    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) model : vec3f,
    @builtin(position) position : vec4f
  
}


${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
struct Skin
{
    matrices : array<mat4x4<f32>,140>
}
@group(2) @binding(0)  var<uniform> skin : Skin ;

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    var skinMatrix = skin.matrices[aJoints.x]*aWeights.x;
    skinMatrix+= skin.matrices[aJoints.y]*aWeights.y;
    skinMatrix+= skin.matrices[aJoints.z]*aWeights.z;
   skinMatrix+= skin.matrices[aJoints.w]*aWeights.w;
    
    
    output.model =( skinMatrix*vec4( aPos,1.0)).xyz;
    output.position =camera.viewProjectionMatrix*skinMatrix *vec4( aPos,1.0);


    return output;
}
@fragment
fn mainFragment(@location(0) model: vec3f)  -> @location(0) vec4f
{

 

  return vec4(distance(model,camera.worldPosition.xyz),0.0,0.0,1.0);
 
}

        
        
        
        
        
        
        
        
        `
    }


}

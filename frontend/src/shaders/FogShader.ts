import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {cubeShadow, getWorldFromUVDepth} from "./ShaderChunks";
import {Vector3, Vector4} from "math.gl";
import {AddressMode, TextureViewDimension} from "../lib/WebGPUConstants";

export default class FogShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);

            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("pointlightPos", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("pointlightColor", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("time", 0);
        this.addTexture("shadowCubeDebug", this.renderer.texturesByLabel["ShadowCubeColor1"], "float", TextureViewDimension.Cube)
        this.addTexture("gDepth", this.renderer.texturesByLabel["GDepth"], "unfilterable-float");
        this.addTexture("fog", this.renderer.texturesByLabel["fog.png"], "float");
        this.addTexture("noise", this.renderer.texturesByLabel["noiseTexture.png"], "float");
        this.addSampler("mySampler", GPUShaderStage.FRAGMENT, AddressMode.MirrorRepeat);

        this.needsTransform = true;
        this.needsCamera = true;

    }

    getKernel() {
        let numSamples = 16;
        let s = "const kernel = array<vec3f, " + numSamples + ">(";
        for (let i = 0; i < numSamples; i++) {
            let v = new Vector3(
                Math.random() * 2.0 - 1.0,
                Math.random() * 2.0 - 1.0,
                Math.random() * 2.0 - 1.0
            );
            v.normalize();

            v.scale(.01);


            s += "vec3(" + v.x + ", " + v.y + "," + v.z + "),";
        }
        s += " );";
        return s;
    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
   @location(0) uv0 : vec2f,
    @location(1) normal : vec3f,
 

     @location(2) world : vec3f,
     @location(3) projPos : vec4f,
    @builtin(position) position : vec4f
  
}

 ${this.getKernel()}
${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}
${getWorldFromUVDepth()}
fn random(st : vec2f ) -> f32 {
  return fract(sin(dot(st.xy, vec2f(12.9898, 78.233))) * 43758.5453123)-0.5;
}

${cubeShadow()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    var pos = aPos;
    pos.y+=sin(pos.x*10.0+uniforms.time*5.0)*0.5;
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( pos,1.0);
    output.uv0 =aUV0;
    output.projPos =output.position;
    output.world =(model.modelMatrix *vec4( pos,1.0)).xyz;
    output.normal =model.normalMatrix *aNormal;
   
    return output;
}


@fragment
fn mainFragment(@location(0) uv0: vec2f,@location(1) normal: vec3f,@location(2) world: vec3f,@location(3) projPos: vec4f) -> @location(0) vec4f
{
    let textureSize =vec2<f32>( textureDimensions(gDepth));
    var uvScreen = (projPos.xy/projPos.w)*0.5+0.5;
    uvScreen.y =1.0-uvScreen.y;

    let uvScreenI = vec2<i32>(floor(uvScreen  *textureSize));
    let depth =textureLoad(gDepth,  uvScreenI ,0).x; 
    let worldL=getWorldFromUVDepth(uv0 ,depth); 
    let d =world.z -worldL.z;
    
   var uvFog  = uv0;
   uvFog.x +=uniforms.time*0.7;
     var uvNoise  = uv0;
   uvNoise.x -=uniforms.time*0.2;
   uvNoise.y +=uniforms.time*0.1;
   uvNoise.x*=2.3;
    var noise =(textureSample(noise, mySampler,   uvNoise).xy)*0.15;
    var alpha =(textureSample(fog, mySampler,   uvFog+noise).x);
  

 alpha *=smoothstep(0.0,2.0,d);
 
   let shadowColorP =cubeShadow(shadowCubeDebug,uniforms.pointlightPos.xyz,world,uv0 ,2.0);

 let distToLight=distance (uniforms.pointlightPos.xyz,world);

     let an  =1.0/pow( distToLight,1.0);
   
alpha*=smoothstep(0.0,0.2,uv0.x)*smoothstep(0.0,0.2,1.0-uv0.x)*0.1;

  return vec4(vec3(uniforms.pointlightColor.xyz*uniforms.pointlightColor.w*0.5*an *shadowColorP)*alpha,alpha);
 
}
///////////////////////////////////////////////////////////
              
        `
    }


}

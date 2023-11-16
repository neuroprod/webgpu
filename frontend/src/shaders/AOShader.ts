import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector3} from "math.gl";
import Camera from "../lib/Camera";



export default class AOShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("radius", 1.0);
        this.addUniform("strength", 1.0);
        this.addUniform("numSamples", 8.0);
        this.addTexture("gPosition",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gNormal",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        // this.addSampler("mySampler");
        this.needsCamera =true;
        this.logShaderCode =true;
    }

    getKernel() {
        let numSamples = 64;
        let s = "const kernel = array<vec3f, " + numSamples + ">(";
        for (let i = 0; i < numSamples; i++) {
            let v = new Vector3(
                Math.random() * 2.0 - 1.0,
                Math.random() * 2.0 - 1.0,
                Math.random()
            );
            v.normalize();
            v.y += 0.01;
            v.normalize();
            let p = Math.random();
            v.multiplyByScalar(p*p);

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
 
    @builtin(position) position : vec4f
  
}



${Camera.getShaderText(0)}
${this.getShaderUniforms(1)}
${this.getKernel()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
 
    
    output.position =vec4( aPos,1.0);
    
  
    output.uv0 =aUV0;
   
    return output;
}

fn random(st : vec2f ) -> f32 {
  return fract(sin(dot(st.xy, vec2f(12.9898, 78.233))) * 43758.5453123)-0.5;
}

@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{
    let textureSize =vec2<f32>( textureDimensions(gNormal));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
    let world=textureLoad(gPosition,  uvPos ,0).xyz; 
    let normal = (textureLoad(gNormal,  uvPos ,0).xyz-0.5) *2.0;
    
     let randomVec =normalize(vec3f(random(uv0),random(uv0.yx +vec2f(3.9333)),random(uv0.yx+vec2f(0.9))));
     let tangent   = normalize(randomVec - normal * dot(randomVec, normal));
     let bitangent = cross(normal, tangent);
     let TBN       = mat3x3<f32>(tangent, bitangent, normal); 
    
     var value  =0.0;
     let s =i32(uniforms.numSamples);
     
     for (var i: i32 = 0; i < s; i++) {
        let samplePos3D = (TBN*(kernel[i])*uniforms.radius)+world.xyz;
 
        let posDistance  =distance(samplePos3D,camera.worldPosition.xyz);
        let pos2D = camera.viewProjectionMatrix*vec4f(  samplePos3D,1.0);
        var uvSample = pos2D.xy;
        uvSample/=pos2D.w*2.0;
        uvSample+=vec2f(0.5);
        uvSample.y = 1.0- uvSample.y ;
        let uvK =  vec2<i32>(floor(uvSample*textureSize));
      
        let positionKernel=textureLoad(gPosition,   uvK,0).xyz;
        if(positionKernel.z==0) {//value+=1.0 ;
        continue;}
        
        let kernelDistance = distance(positionKernel,world);
        if(kernelDistance>uniforms.radius) {
      
        continue;}
         
         let sampleDistance  =distance(positionKernel,camera.worldPosition.xyz);
         let dif = posDistance-sampleDistance;
        if(dif>0.01){
       
        value+=1.0-pow( kernelDistance/uniforms.radius,4.0);
        }
      
         
     }
     value/=uniforms.numSamples;
       value =1.0-value;
     return  vec4f(vec3f(value*uniforms.strength+(1.0-uniforms.strength)),1.0);
}
///////////////////////////////////////////////////////////
        `
    }



}

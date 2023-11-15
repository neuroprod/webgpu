import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {Vector2, Vector3, Vector4} from "math.gl";

export default class LightShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);


        }
        this.addUniform("position",new Vector4(0,-1.5,-3,1));
        this.addUniform("textureSize",new Vector2(10,10));
      //  this.addUniform("size",20.0);



        this.addTexture("gPosition",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gNormal",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gMRA",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gColor",DefaultTextures.getWhite(this.renderer),"unfilterable-float")

        this.needsTransform =true;
        this.needsCamera=true;

        this.logShaderCode =true;
    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{

    @location(0) projPos : vec4f,
    @builtin(position) position : vec4f
  
}
${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}

fn rand(n:vec2f )->f32 { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
const PI = 3.14159265359;

fn fresnelSchlick(cosTheta:f32, F0:vec3f)-> vec3f
{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
fn DistributionGGX( N:vec3f,  H:vec3f,  roughness:f32)-> f32
{
    let a      = roughness*roughness;
    let a2     = a*a;
    let NdotH  = max(dot(N, H), 0.0);
    let NdotH2 = NdotH*NdotH;

    let num   = a2;
    var denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num / denom;
}
fn GeometrySmith( N:vec3f,  V:vec3f,  L:vec3f, roughness:f32)-> f32
{
    let NdotV = max(dot(N, V), 0.0);
    let NdotL = max(dot(N, L), 0.0);
    let ggx2  = GeometrySchlickGGX(NdotV, roughness);
    let ggx1  = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

fn GeometrySchlickGGX(NdotV:f32,  roughness:f32)-> f32
{
    let r = (roughness + 1.0);
    let k = (r*r) / 8.0;

    let num   = NdotV;
    let denom = NdotV * (1.0 - k) + k;

    return num / denom;
}
const m1 = mat3x3f(
    0.59719, 0.07600, 0.02840,
    0.35458, 0.90834, 0.13383,
    0.04823, 0.01566, 0.83777
    );
const m2 = mat3x3f(
    1.60475, -0.10208, -0.00327,
    -0.53108,  1.10813, -0.07276,
    -0.07367, -0.00605,  1.07602
    );
fn acestonemap( color:vec3f)->vec3f{
  
    let v = m1 * color;
    let a = v * (v + 0.0245786) - 0.000090537;
    let b = v * (0.983729 * v + 0.4329510) + 0.238081;
    let r=m2 * (a / b);
    return pow(clamp(r, vec3f(0.0), vec3f(1.0)), vec3f(1. / 2.2));
}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    
 

    var position = camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
    
    output.position =position;
    

   
    output.projPos =position;
  
    return output;
}

@fragment
fn mainFragment(@location(0) projPos: vec4f) -> @location(0) vec4f
{

    var uv0 = (projPos.xy/projPos.w)*0.5+0.5;
    uv0.y =1.0-uv0.y;

    let uvPos = vec2<i32>(floor(uv0*uniforms.textureSize.xy));

    let world=textureLoad(gPosition,  uvPos ,0).xyz; 
    let dist=distance (uniforms.position.xyz,world)/uniforms.position.w;
    if(dist>1.0){return vec4(0,0,0,1.0);}

    let traceDir =-normalize (world-uniforms.position.xyz)*0.5;

    let numSteps =20.0;
    let traceDirScaled = traceDir/numSteps ;
    let traceOffset =traceDirScaled*abs(rand(uv0))+world ;
    var c =1.0;
    for (var i = 0.0; i < numSteps; i+=1.0) {
        let tracePos= traceOffset + traceDirScaled *i;
        let screenPos = camera.viewProjectionMatrix*vec4(tracePos,1.0);
        var screenUV= (screenPos.xy/screenPos.w)*0.5+0.5;
        screenUV.y= 1.0-screenUV.y;
       
        let screenUVi = vec2<i32>(floor( screenUV*uniforms.textureSize));
        let worldS=textureLoad(gPosition,  screenUVi ,0).xyz; 
        if(worldS.z==0) {continue;}
        if(distance(tracePos,camera.worldPosition.xyz)-0.01>distance(worldS,camera.worldPosition.xyz)){
           return vec4(0.0,0.0,0.0,1.0);
       
        }
    }

       let albedo =pow(textureLoad(gColor,  uvPos ,0).xyz,vec3(2.2));
       
      
       let an= pow(1.0-dist,2.0); 

  
        let N = (textureLoad(gNormal,  uvPos ,0).xyz-0.5) *2.0;
   
   
        let mra =textureLoad(gMRA,  uvPos ,0).xyz ;
        let roughness = mra.y;
        let metallic = mra.x;

        let V = normalize(camera.worldPosition.xyz - world);
        let F0 = mix(vec3(0.04), albedo, metallic);
       
        let lightVec = uniforms.position.xyz - world;
    let L = normalize(lightVec);
    let H = normalize(V + L);
  
    
    
    let NdotV = max(0.0, dot(N, V));
    let NDF = DistributionGGX(N, H, roughness);
    let G   = GeometrySmith(N, V, L, roughness);
    let F    = fresnelSchlick(max(dot(H, V), 0.0), F0);
 
    let kS = F;
    let kD = vec3(1.0) - kS;
    
      let numerator    = NDF * G * F;
    let denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    let specular     = numerator / denominator;
    
    let radiance =vec3(1.0,0.5,0.5)*an*20.0;
    
    let NdotL = max(dot(N, L), 0.0);
    let light= (kD * albedo / PI + specular) * radiance * NdotL ;
     return vec4(acestonemap( light),1.0);
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}

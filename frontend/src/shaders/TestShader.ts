import Shader from "../lib/core/Shader";

import DefaultTextures from "../lib/textures/DefaultTextures";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";

export default class TestShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aNormal", ShaderType.vec3);
            this.addAttribute("aTangent", ShaderType.vec4);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("scale", 1);
        this.addTexture("colorTexture", DefaultTextures.getWhite(this.renderer))
        this.addTexture("mraTexture", DefaultTextures.getWhite(this.renderer))
        this.addTexture("normalTexture", DefaultTextures.getNormal(this.renderer))
        this.addSampler("mySampler")
        // this.addVertexOutput("normal",3);
        // this.addVertexOutput("uv0",2);
        this.needsTransform = true;
        this.needsCamera = true;
    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) normal : vec3f,
    @location(1) uv0 : vec2f,
    @location(2) world : vec3f,
    @location(3) tangent : vec3f,
    @location(4) biTangent : vec3f,
    @builtin(position) position : vec4f
  
}
${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}
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
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    
 
    //output.tbn =model.normalMatrix* mat3x3f(aTangent.xyz, biTangent, aNormal);

    
    output.position =camera.viewProjectionMatrix*model.modelMatrix *vec4( aPos,1.0);
    
    output.world = (model.modelMatrix *vec4( aPos,1.0)).xyz;
   
    output.uv0 =aUV0;
    output.normal =model.normalMatrix *aNormal;
    output.tangent =model.normalMatrix*aTangent.xyz;
     output.biTangent =model.normalMatrix* (normalize(cross( aTangent.xyz, aNormal))*aTangent.w);
    return output;
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
const  lightPos = array<vec3f, 3>(vec3f(1.0,1.5,0.0),vec3f(0.0,1.5,-3.0),vec3f(-1.0,0.5,-1.0));
const  lightColor = array<vec3f, 3>(vec3f(1.0,1.0,1.0),vec3f(1.0,0.5,0.5),vec3f(0.5,0.5,1.0));
@fragment
fn mainFragment(@location(0) normal: vec3f,@location(1) uv0: vec2f,@location(2) world: vec3f,@location(3) tangent: vec3f,@location(4) biTangent: vec3f) -> @location(0) vec4f
{

    let albedo = pow(textureSample(colorTexture, mySampler,  uv0).xyz,vec3(2.2));
    
    var normalText = textureSample(normalTexture, mySampler,  uv0).xyz* 2. - 1.;
    let N = mat3x3f(normalize(tangent),normalize(biTangent),normalize(normal))*normalize(normalText);
   
   
    let mra =textureSample(mraTexture, mySampler,  uv0).xyz ;
    let roughness = mra.y;
    let metallic = mra.x;
    
    let V = normalize(camera.worldPosition - world);
    let F0 = mix(vec3(0.04), albedo, metallic);
    
    

    

    var light =vec3(0.0);
    for(var  i:i32 = 0; i < 3; i++) 
    {
       let lightVec = lightPos[i] - world;
    let L = normalize(lightVec);
    let H = normalize(V + L);
    let distance = length(lightVec)*0.3;
    
    
    let NdotV = max(0.0, dot(N, V));
    let NDF = DistributionGGX(N, H, roughness);
    let G   = GeometrySmith(N, V, L, roughness);
    let F    = fresnelSchlick(max(dot(H, V), 0.0), F0);
 
    let kS = F;
    let kD = vec3(1.0) - kS;
    
      let numerator    = NDF * G * F;
    let denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    let specular     = numerator / denominator;
    
    let radiance =lightColor[i] *(1.0 / (distance * distance));;
    
    let NdotL = max(dot(N, L), 0.0);
    light+= (kD * albedo / PI + specular) * radiance * NdotL;
    }
    light+=albedo* (1.0-metallic)*0.3*(1.0-(1.0-mra.z));
  light*=(1.0-(1.0-mra.z)*0.5);
    light*=1.8;
     return vec4f( acestonemap(light),1.0) ;
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

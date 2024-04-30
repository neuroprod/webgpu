import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import Camera from "../lib/Camera";
import ModelTransform from "../lib/model/ModelTransform";
import {pointLight} from "../shaders/ShaderChunks";

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
        this.addUniform("shading", 0);
        this.addUniform("text", 0);
        this.addTexture("colorTexture", this.renderer.texturesByLabel["textures/pants3D_Color.webp"])
        this.addTexture("mraTexture", this.renderer.texturesByLabel["textures/pants3D_MRA.webp"])
        this.addTexture("normalTexture", this.renderer.texturesByLabel["textures/pants3D_Normal.webp"])
        this.addSampler("mySampler", GPUShaderStage.FRAGMENT, "repeat")

        this.needsTransform = true;
        this.needsCamera = true;
        this.logShaderCode = true
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

${Camera.getShaderText(0)}
${ModelTransform.getShaderText(1)}
${this.getShaderUniforms(2)}
${pointLight()}
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


    var normalText = textureSample(normalTexture, mySampler,  uv0).xyz* 2. - 1.;
    
    let N = mat3x3f(normalize(tangent),normalize(biTangent),normalize(normal))*normalText;
   let albedo = pow(textureSample(colorTexture, mySampler,  uv0).xyz,vec3(2.2));
   
   
   
   let mra = textureSample(mraTexture, mySampler,  uv0).xyz; 
   
   let roughness = mra.y;
   let metallic = mra.x;
   let V = normalize(camera.worldPosition.xyz - world);
   let F0 = mix(vec3(0.04), albedo, metallic);
   
    var lightL =  pointLight(vec3f(1.0,0.0,2.0),vec4f(5.0),albedo,world,N,V,F0,roughness);
    //lightL +=  pointLight(vec3f(2.0,1.0,2.0),vec4f(5.0),albedo,world,N,V,F0,roughness);
    lightL +=albedo*0.3;
    lightL *=mra.z;
    var t = albedo;
     if(uniforms.text >1.5){t = N;}
    else if(uniforms.text >0.5 ){t =vec3( mra.y);}
   
      lightL  =mix( t,lightL,uniforms.shading);
    let outColor = clamp(vec3(0.0),vec3(1.0), lightL *0.3);

  
   let edge = 1.0-edgeFactor(color);

   let alpha =edge + (1.0-uniforms.lineThickness);
 var colorR = mix(vec3(5.0),outColor,1.0-uniforms.lineThickness) ;

  return vec4( colorR*alpha,alpha);
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }


}

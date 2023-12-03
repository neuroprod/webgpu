import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector3, Vector4} from "math.gl";
import {getWorldFromUVDepth} from "./ShaderChunks";
import Camera from "../lib/Camera";
import {TextureViewDimension} from "../lib/WebGPUConstants";




export default class GlobalLightOutsideShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("shadowMatrix",0,GPUShaderStage.FRAGMENT,ShaderType.mat4)
        this.addUniform("lightDir",new Vector4(1,0.7,0.7,0.1))
        this.addUniform("lightColor",new Vector4(1,0.7,0.7,0.1))
        this.addUniform("topColor",new Vector4(1,0.7,0.7,0.1))
        this.addUniform("midColor",new Vector4(1,1,1,0.05))
        this.addUniform("bottomColor",new Vector4(1,1,1,0.02))
        this.addUniform("dof",new Vector4(0.5,0.6,0.0,0.0))
        this.addTexture("shadow",DefaultTextures.getWhite(this.renderer),"depth")
        this.addTexture("gDepth",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gColor",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gNormal",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("gMRA",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addTexture("aoTexture",DefaultTextures.getWhite(this.renderer),"unfilterable-float")
        this.addSamplerComparison("mySamplerComp");

        this.needsCamera =true;
this.logShaderCode=true;

    }
    getKernel() {
        let numSamples =16;
        let s = "const kernel = array<vec3f, " + numSamples + ">(";
        for (let i = 0; i < numSamples; i++) {
            let v = new Vector3(
                Math.random() * 2.0 - 1.0,
                Math.random() * 2.0 - 1.0,
                Math.random()* 2.0 - 1.0
            );
            v.normalize();

            v.scale(.005);


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
 ${this.getKernel()}
${Camera.getShaderText(0)}
${this.getShaderUniforms(1)}
${getWorldFromUVDepth()}
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




    let textureSize =vec2<f32>( textureDimensions(gColor));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
   let depth = textureLoad(gDepth,  uvPos ,0).x;
    let world=getWorldFromUVDepth(uv0 ,depth); 
    
    
    //shadow
    let shadowProj =uniforms.shadowMatrix*vec4(world,1.0);
    let shadowProjN=shadowProj.xyz/ shadowProj.w;
    var shadowUV =shadowProjN.xy * vec2(0.5, -0.5) + vec2(0.5);
  let oneOverShadowDepthTextureSize = 1.0 / 2048.0;
   var shadowVal =0.0;
  for (var y = -1; y <= 1; y++) {
    for (var x = -1; x <= 1; x++) {
      let offset = vec2<f32>(vec2i(x, y)) * oneOverShadowDepthTextureSize;
    shadowVal += textureSampleCompare(shadow, mySamplerComp, shadowUV+offset, shadowProjN.z-0.005);
  }
  }
  shadowVal/=9.0;
    
    let albedo =pow(textureLoad(gColor,  uvPos ,0).xyz,vec3(2.2));;
    let N = normalize((textureLoad(gNormal,  uvPos ,0).xyz-0.5) *2.0);
    let mra =textureLoad(gMRA,  uvPos ,0).xyz ;
    
    
    let textureSizeAO =vec2<f32>( textureDimensions(aoTexture));
    let uvPosAO = vec2<i32>(floor(uv0*textureSizeAO));
      
    let ao = textureLoad(aoTexture,  uvPosAO ,0).x ;
    let l = dot(N,vec3(0,1.0,0));
    let light =mix( mix(uniforms.midColor.xyz*uniforms.midColor.w,uniforms.topColor.xyz*uniforms.topColor.w,max(0.0,l)),uniforms.bottomColor.xyz*uniforms.bottomColor.w,max(0.0,-l));
    let color = albedo*light*ao*(1.0-mra.x) +albedo*pow(mra.z,2.0)*10.0;



        let roughness = mra.y;
        let metallic = mra.x;
        let V = normalize(camera.worldPosition.xyz - world);
        let F0 = mix(vec3(0.04), albedo, metallic);
       
     
        let L = normalize(-uniforms.lightDir.xyz);
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
  
        let radiance =uniforms.lightColor.xyz *uniforms.lightColor.w;
    
        let NdotL = max(dot(N, L), 0.0);
        let lightL= (kD * albedo / PI + specular) * radiance * NdotL ;




    return vec4(color+lightL*shadowVal*ao,smoothstep(uniforms.dof.x,uniforms.dof.y,depth) );
}
///////////////////////////////////////////////////////////
        `
    }



}

import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector3, Vector4} from "math.gl";
import {cubeShadow, getWorldFromUVDepth, pointLight} from "./ShaderChunks";
import Camera from "../lib/Camera";
import {TextureViewDimension} from "../lib/WebGPUConstants";


export default class GlobalLightIntroShader extends Shader {


    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }

        this.addUniform("lightPos1", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("lightColor1", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("lightPos2", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("lightColor2", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("lightPos3", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("lightColor3", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("lightPos4", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("lightColor4", new Vector4(1, 0.7, 0.7, 0.1))

        this.addUniform("topColor", new Vector4(1, 0.7, 0.7, 0.1))
        this.addUniform("midColor", new Vector4(1, 1, 1, 0.05))
        this.addUniform("bottomColor", new Vector4(1, 1, 1, 0.02))


        this.addTexture("shadowCube2", DefaultTextures.getCube(this.renderer), "float", TextureViewDimension.Cube)
        this.addTexture("shadowCube1", DefaultTextures.getCube(this.renderer), "float", TextureViewDimension.Cube)
        this.addTexture("shadowCube3", DefaultTextures.getCube(this.renderer), "float", TextureViewDimension.Cube)
        this.addTexture("shadowCube4", DefaultTextures.getCube(this.renderer), "float", TextureViewDimension.Cube)
        // this.addTexture("shadowCube",DefaultTextures.getCube(this.renderer),"depth",TextureViewDimension.Cube)
        this.addTexture("gDepth", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gColor", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gNormal", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("gMRA", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addTexture("aoTexture", DefaultTextures.getWhite(this.renderer), "unfilterable-float")
        this.addSamplerComparison("mySamplerComp");
        this.addSampler("mySampler");
        this.needsCamera = true;
//this.logShaderCode=true;

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

            v.scale(.001);


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
fn gtao_multibounce(visibility: f32, base_color: vec3<f32>) -> vec3<f32> {
    let a = 2.0404 * base_color - 0.3324;
    let b = -4.7951 * base_color + 0.6417;
    let c = 2.7552 * base_color + 0.6903;
    let x = vec3<f32>(visibility);
    return max(x, ((x * a + b) * x + c) * x);
}
${Camera.getShaderText(0)}
${this.getShaderUniforms(1)}
${getWorldFromUVDepth()}
${pointLight()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
 
    
    output.position =vec4( aPos,1.0);
    
  
    output.uv0 =aUV0;
   
    return output;
}
 ${this.getKernel()}
fn random(st : vec2f ) -> f32 {
  return fract(sin(dot(st.xy, vec2f(12.9898, 78.233))) * 43758.5453123)-0.5;
}

${cubeShadow()}

@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{




    let textureSize =vec2<f32>( textureDimensions(gColor));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
    let depth = textureLoad(gDepth,  uvPos ,0).x;
    let world=getWorldFromUVDepth(uv0 ,depth); 
    
    let albedo =pow(textureLoad(gColor,  uvPos ,0).xyz,vec3(2.2));;
    let N = normalize((textureLoad(gNormal,  uvPos ,0).xyz-0.5) *2.0);
    let mra =textureLoad(gMRA,  uvPos ,0) ;
    
   
    let textureSizeAO =vec2<f32>( textureDimensions(aoTexture));
    let uvPosAO = vec2<i32>(floor(uv0*textureSizeAO));
      
    let ao = textureLoad(aoTexture,  uvPosAO ,0).x ;
    
    
    let l = dot(N,vec3(0.0,1.0,0.0));
    let light =mix( mix(uniforms.midColor.xyz*uniforms.midColor.w,uniforms.topColor.xyz*uniforms.topColor.w,max(0.0,l)),uniforms.bottomColor.xyz*uniforms.bottomColor.w,max(0.0,-l));
   

    
    let color = albedo*light*ao*(1.0-mra.x) +albedo*pow(mra.z,2.0)*10.0;


    ////shadow
   


  


        let roughness = mra.y;
        let metallic = mra.x;
        let V = normalize(camera.worldPosition.xyz - world);
        let F0 = mix(vec3(0.04), albedo, metallic);
       

       
       
    let shadowColor1 =cubeShadow(shadowCube1,uniforms.lightPos1.xyz,world,uv0,2.0);
    var lightL =  pointLight(uniforms.lightPos1.xyz,uniforms.lightColor1,albedo,world,N,V,F0,roughness)*shadowColor1;
    
    let shadowColor2 =cubeShadow(shadowCube2,uniforms.lightPos2.xyz,world,uv0,2.0);
    lightL +=  pointLight(uniforms.lightPos2.xyz,uniforms.lightColor2,albedo,world,N,V,F0,roughness)*shadowColor2;
 
    let shadowColor3 =cubeShadow(shadowCube3,uniforms.lightPos3.xyz,world,uv0,2.0);
    lightL +=  pointLight(uniforms.lightPos3.xyz,uniforms.lightColor3,albedo,world,N,V,F0,roughness)*shadowColor3;
    
    
     let shadowColor4 =cubeShadow(shadowCube4,uniforms.lightPos4.xyz,world,uv0,2.0);
    lightL +=  pointLight(uniforms.lightPos4.xyz,uniforms.lightColor4,albedo,world,N,V,F0,roughness)*shadowColor4;
 
 
 
    if(mra.w==0.0){return vec4(albedo,0.0);}

    return vec4(color+lightL*ao,0.0 ) ;
}
///////////////////////////////////////////////////////////
        `
    }


}

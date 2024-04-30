import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import Renderer from "../lib/Renderer";
import {Vector4} from "math.gl";


export default class DofShader extends Shader {
    private horizontal: boolean;

    constructor(renderer: Renderer, label = "", horizontal: boolean) {
        super(renderer, label);
        this.horizontal = horizontal;
    }

    getDir(): string {
        if (this.horizontal) return "1.5,0.0";
        return "0.0,1.5"
    }

    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("settings", new Vector4(0, 0, 0, 0));

        this.addTexture("inputTexture", DefaultTextures.getWhite(this.renderer), "float")

        this.addSampler("mySampler")

    }

    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{
    @location(0) uv0 : vec2f,
 
    @builtin(position) position : vec4f
  
}




${this.getShaderUniforms(0)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
 
    
    output.position =vec4( aPos,1.0);
    
  
    output.uv0 =aUV0;
   
    return output;
}


@fragment
fn mainFragment(@location(0)  uv0: vec2f) -> @location(0) vec4f
{

    let textureSize =vec2<f32>( textureDimensions(inputTexture));
  let uvPos = vec2<i32>(floor(uv0*textureSize));
    
    let color=   textureLoad(inputTexture, uvPos,0);
 //if(color.w==0){return vec4(color); }
    
    let pixelSize =vec2(1.0)/textureSize;
    var colorBlur =vec3f(0.0);
    var div =0.0;

    

    let dir =vec2(${this.getDir()})*pixelSize*color.w*uniforms.settings.w ;
    let stepp =round(uniforms.settings.z);
    for(var i=-stepp;i<(stepp+1.0);i+=1.0)
    {
        
           
            let r = textureSample(inputTexture, mySampler,uv0+(dir*i ));


            colorBlur+=r.xyz *r.w;
            div+=r.w;
        
    }

 
    colorBlur/=div;
    
    
    
    if(color.w<0.05){return vec4(color); }
     
 
    //return vec4(color.xyz *step(0.99,1.0-color.w),color.w);
    return vec4(colorBlur,color.w) ;
}
///////////////////////////////////////////////////////////
        `
    }


}

import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import Renderer from "../lib/Renderer";
import {Vector4} from "math.gl";



export default class DofShader extends Shader{
    private horizontal: boolean;

    constructor(renderer: Renderer, label = "",horizontal:boolean) {
        super(renderer, label);
        this.horizontal =horizontal;
    }
    getDir():string
    {
        if(this.horizontal)return "2,0";
        return "0,2"
    }
    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform( "settings",new Vector4(0,0,0,0));

        this.addTexture("inputTexture",DefaultTextures.getWhite(this.renderer),"unfilterable-float")



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
   if(color.w==0){return vec4(color); }
    
    
    var colorBlur =vec3f(0.0);
    var div =0.0;

    
  
    let dir =vec2<i32>(${this.getDir()});
    let step =i32 (round(uniforms.settings.z));
    for(var i=-step;i<(step+1);i+=1)
    {
        
            let uv =uvPos+dir*i;
            let r =textureLoad(inputTexture,   uv,0);

            colorBlur+=r.xyz *r.w;
            div+=r.w;
        
    }

 
    colorBlur/=div;
    
    
    
    
    
    
    
    return vec4(mix(color.xyz,colorBlur,color.w),color.w) ;
}
///////////////////////////////////////////////////////////
        `
    }



}

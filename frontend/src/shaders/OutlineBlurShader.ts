import Shader from "../lib/core/Shader";
import {ShaderType} from "../lib/core/ShaderTypes";
import DefaultTextures from "../lib/textures/DefaultTextures";
import Renderer from "../lib/Renderer";
import {Vector4} from "math.gl";


export default class OutlineBlurShader extends Shader {
    private horizontal: boolean;

    constructor(renderer: Renderer, label = "", horizontal: boolean) {
        super(renderer, label);
        this.horizontal = horizontal;
    }

    getDir(): string {
        if (this.horizontal) return "1,0";
        return "0,1"
    }

    init() {

        if (this.attributes.length == 0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("settings", new Vector4(0, 0, 0, 0));

        this.addTexture("inputTexture", DefaultTextures.getWhite(this.renderer), "float")


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
    
    let dir =vec2i(${this.getDir()});
    let stepp =5;
    var colorBlur =vec2(0.0,0.0);
    for(var i=-stepp;i<=stepp;i+=1)
    {
             colorBlur+= textureLoad(inputTexture,  uvPos+i*dir ,0).xy;
    }
    colorBlur/=10.0;
  
    return vec4(colorBlur,0.0,0.0) ;
}
///////////////////////////////////////////////////////////
        `
    }


}

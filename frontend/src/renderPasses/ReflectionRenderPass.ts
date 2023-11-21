import RenderPass from "../lib/core/RenderPass";

import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import {TextureFormat} from "../lib/WebGPUConstants";


import Material from "../lib/core/Material";


import Blit from "../lib/Blit";

import ReflectShader from "../shaders/ReflectShader";
import {Vector4} from "math.gl";
import UI from "../lib/UI/UI";


export default class ReflectionRenderPass extends RenderPass {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;
    private reflectMaterial: Material;
    private blitReflect: Blit;
private settings =new Vector4(0.0,0.3,0.7,1.0);

    constructor(renderer: Renderer) {

        super(renderer, "reflectionRenderPass");


        this.target = new RenderTexture(renderer, "ReflectionPass", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier:1.0,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];


        this.reflectMaterial = new Material(this.renderer, "reflectMaterial", new ReflectShader(this.renderer, "reflect"))

        this.reflectMaterial.uniforms.setUniform("settings",this.settings)
        this.reflectMaterial.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
        this.reflectMaterial.uniforms.setTexture("gNormal", this.renderer.texturesByLabel["GNormal"])
        this.reflectMaterial.uniforms.setTexture("gMRA", this.renderer.texturesByLabel["GMRA"])
        this.reflectMaterial.uniforms.setTexture("gColor", this.renderer.texturesByLabel["GColor"])
        this.reflectMaterial.uniforms.setTexture("lut", this.renderer.texturesByLabel["brdf_lut.png"])
        this.reflectMaterial.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["BlurLightPass"])


        this.blitReflect = new Blit(renderer, 'reflectBlit', this.reflectMaterial)

    }


    onUI() {
        UI.separator("SSR")
        this.settings.x =UI.LFloatSlider("maxDistScale",this.settings.x,0.01,0.1)
        this.settings.y =UI.LFloatSlider("maxDistScale2",this.settings.y,0.01,0.2)
        this.settings.z =UI.LFloatSlider("str",this.settings.z,0.01,1.0)
        this.reflectMaterial.uniforms.setUniform("settings",this.settings)
    }

    draw() {
        this.blitReflect.draw(this);


    }
}

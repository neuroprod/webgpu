import RenderPass from "./lib/core/RenderPass";

import RenderTexture from "./lib/textures/RenderTexture";
import ColorAttachment from "./lib/textures/ColorAttachment";
import Renderer from "./lib/Renderer";
import {TextureFormat} from "./lib/WebGPUConstants";


import Material from "./lib/core/Material";


import Blit from "./lib/Blit";

import ReflectShader from "./shaders/ReflectShader";


export default class ReflectionRenderPass extends RenderPass {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;
    private reflectMaterial: Material;
    private blitReflect: Blit;


    constructor(renderer: Renderer) {

        super(renderer, "reflectionRenderPass");


        this.target = new RenderTexture(renderer, "ReflectionPass", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier:0.5,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];


        this.reflectMaterial = new Material(this.renderer, "reflectMaterial", new ReflectShader(this.renderer, "reflect"))


        this.reflectMaterial.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
        this.reflectMaterial.uniforms.setTexture("gNormal", this.renderer.texturesByLabel["GNormal"])
        this.reflectMaterial.uniforms.setTexture("gMRA", this.renderer.texturesByLabel["GMRA"])
        this.reflectMaterial.uniforms.setTexture("gColor", this.renderer.texturesByLabel["GColor"])
        this.reflectMaterial.uniforms.setTexture("lut", this.renderer.texturesByLabel["brdf_lut.png"])
        this.reflectMaterial.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["BlurLightPass"])


        this.blitReflect = new Blit(renderer, 'reflectBlit', this.reflectMaterial)

    }


    onUI() {

    }

    draw() {
        this.blitReflect.draw(this);


    }
}

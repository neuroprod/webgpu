import RenderPass from "../lib/core/RenderPass";

import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import {TextureFormat} from "../lib/WebGPUConstants";


import Material from "../lib/core/Material";


import Blit from "../lib/Blit";

import ReflectShader from "../shaders/ReflectShader";
import RenderSettings from "../RenderSettings";


export default class ReflectionRenderPass extends RenderPass {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;
    private reflectMaterial: Material;
    private blitReflect: Blit;


    constructor(renderer: Renderer) {

        super(renderer, "reflectionRenderPass");

        RenderSettings.registerPass(this);
        this.target = new RenderTexture(renderer, "ReflectionPass", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier: 1.0,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];


        this.reflectMaterial = new Material(this.renderer, "reflectMaterial", new ReflectShader(this.renderer, "reflect"))


        this.reflectMaterial.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
        this.reflectMaterial.uniforms.setTexture("gNormal", this.renderer.texturesByLabel["GNormal"])
        this.reflectMaterial.uniforms.setTexture("gMRA", this.renderer.texturesByLabel["GMRA"])
        this.reflectMaterial.uniforms.setTexture("gColor", this.renderer.texturesByLabel["GColor"])

        this.reflectMaterial.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["BlurLightPass"])


        this.blitReflect = new Blit(renderer, 'reflectBlit', this.reflectMaterial)

    }

    onSettingsChange() {
        super.onSettingsChange();
        this.reflectMaterial.uniforms.setUniform("refSettings1", RenderSettings.ref_settings1)
        this.reflectMaterial.uniforms.setUniform("refSettings2", RenderSettings.ref_settings2)
    }

    onUI() {

    }

    draw() {
        this.blitReflect.draw(this);


    }
}

import RenderPass from "../lib/core/RenderPass";
import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Material from "../lib/core/Material";
import Blit from "../lib/Blit";
import Renderer from "../lib/Renderer";
import RenderSettings from "../RenderSettings";
import {TextureFormat} from "../lib/WebGPUConstants";

import PostShader from "../shaders/PostShader";

export default class PostRenderPass extends RenderPass {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;
    private blitMaterial: any;
    private blitFinal: Blit;


    constructor(renderer: Renderer) {

        super(renderer, "postRenderPass");

        RenderSettings.registerPass(this);
        this.target = new RenderTexture(renderer, "PostPass", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier: 1.0,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];

        this.blitMaterial = new Material(this.renderer, "blitPost", new PostShader(this.renderer, "post"))
        this.blitMaterial.uniforms.setTexture("colorTexture", this.renderer.texturesByLabel["DOF"])
        this.blitMaterial.uniforms.setTexture("bloomTexture", this.renderer.texturesByLabel["BlurBloom"])
        this.blitMaterial.uniforms.setTexture("outlineTexture", this.renderer.texturesByLabel["OutlinePrePass"])
        this.blitMaterial.uniforms.setTexture("outlineBlurTexture", this.renderer.texturesByLabel["OutlineBlur"])

        this.blitFinal = new Blit(renderer, 'blitPost', this.blitMaterial)

    }

    onSettingsChange() {
        super.onSettingsChange();
        this.blitMaterial.uniforms.setUniform("exposure", RenderSettings.exposure);
        this.blitMaterial.uniforms.setUniform("contrast", RenderSettings.contrast);
        this.blitMaterial.uniforms.setUniform("brightness", RenderSettings.brightness);
        this.blitMaterial.uniforms.setUniform("vibrance", RenderSettings.vibrance);
        this.blitMaterial.uniforms.setUniform("saturation", RenderSettings.saturation)
        this.blitMaterial.uniforms.setUniform("black", RenderSettings.black);
        this.blitMaterial.uniforms.setUniform("falloff", RenderSettings.vin_falloff);
        this.blitMaterial.uniforms.setUniform("amount", RenderSettings.vin_amount);
        this.blitMaterial.uniforms.setUniform("bloom_strength", RenderSettings.bloom_strength);
    }

    onUI() {

    }

    draw() {
        this.blitFinal.draw(this);


    }
}

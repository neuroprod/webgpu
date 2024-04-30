import RenderPass from "../lib/core/RenderPass";
import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Material from "../lib/core/Material";
import Blit from "../lib/Blit";
import Renderer from "../lib/Renderer";
import RenderSettings from "../RenderSettings";
import {TextureFormat} from "../lib/WebGPUConstants";
import FXAAShader from "../shaders/FXAAShader";

export default class FXAARenderPass extends RenderPass {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;
    private blitMaterial: any;
    private blitFinal: Blit;


    constructor(renderer: Renderer) {

        super(renderer, "FXAARenderPass");

        RenderSettings.registerPass(this);
        this.target = new RenderTexture(renderer, "FXAAPass", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier: 1.0,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];

        this.blitMaterial = new Material(this.renderer, "blitFXAA", new FXAAShader(this.renderer, "fxaa"))
        this.blitMaterial.uniforms.setTexture("screenTexture", this.renderer.texturesByLabel["PostPass"])


        this.blitFinal = new Blit(renderer, 'blitPost', this.blitMaterial)

    }

    onSettingsChange() {
        super.onSettingsChange();

    }

    onUI() {

    }

    draw() {
        this.blitFinal.draw(this);


    }
}

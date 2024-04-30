import RenderPass from "../lib/core/RenderPass";
import ColorAttachment from "../lib/textures/ColorAttachment";
import RenderTexture from "../lib/textures/RenderTexture";
import Material from "../lib/core/Material";
import Blit from "../lib/Blit";
import Renderer from "../lib/Renderer";
import {TextureFormat} from "../lib/WebGPUConstants";

import CombineShader from "../shaders/CombineShader";

import RenderSettings from "../RenderSettings";

export default class CombinePass extends RenderPass {
    public colorAttachment: ColorAttachment;
    private target: RenderTexture;
    public bloomAttachment: ColorAttachment;
    private bloomTarget: RenderTexture;
    public blitMaterial: Material;
    private blit: Blit;


    constructor(renderer: Renderer) {

        super(renderer, "CombinePass");
        RenderSettings.registerPass(this);
        this.target = new RenderTexture(renderer, "CombinePass", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier: 1,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.target);


        this.bloomTarget = new RenderTexture(renderer, "BloomPrePass", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier: 1,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.bloomAttachment = new ColorAttachment(this.bloomTarget);


        this.colorAttachments = [this.colorAttachment, this.bloomAttachment];
        this.blitMaterial = new Material(this.renderer, "blitCombine", new CombineShader(this.renderer, "combinePass"))


        this.blitMaterial.uniforms.setTexture("glassTexture", this.renderer.texturesByLabel["GlassPass"])
        this.blitMaterial.uniforms.setTexture("refTexture", this.renderer.texturesByLabel["ReflectionPass"])
        this.blitMaterial.uniforms.setTexture("lightTexture", this.renderer.texturesByLabel["LightPass"])
        this.blitMaterial.uniforms.setTexture("pantsTexture", this.renderer.texturesByLabel["PantsPass"])
        this.blit = new Blit(renderer, 'blitCombine', this.blitMaterial)
    }

    onSettingsChange() {
        super.onSettingsChange();

        this.blitMaterial.uniforms.setUniform("threshold", RenderSettings.bloom_threshold);
        this.blitMaterial.uniforms.setUniform("softThreshold", RenderSettings.bloom_softThreshold);


    }

    onUI() {


    }

    draw() {

        this.blit.draw(this);


    }
}

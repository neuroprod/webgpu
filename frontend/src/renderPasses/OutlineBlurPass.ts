import RenderPass from "../lib/core/RenderPass";
import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import RenderSettings from "../RenderSettings";

import Material from "../lib/core/Material";


import Blit from "../lib/Blit";
import {TextureFormat} from "../lib/WebGPUConstants";
import OutlineBlurShader from "../shaders/OutlineBlurShader";

export default class OutlineBlurPass extends RenderPass {


    public colorTarget: RenderTexture;
    private colorAttachment: ColorAttachment;

    private blit: Blit;
    private blitMaterial: Material;

    constructor(renderer: Renderer, targetTextureLabel: string) {

        super(renderer, "OutlineBlurPass");
        RenderSettings.registerPass(this);


        this.colorTarget = new RenderTexture(renderer, targetTextureLabel, {
            format: TextureFormat.RG8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.colorTarget, {clearValue: {r: 0.0, g: 0.0, b: 0.0, a: 0.0}});
        this.colorAttachments = [this.colorAttachment]


    }

    init(horizontal: boolean, inputTexture: string) {

        let outlineBlurShader = new OutlineBlurShader(this.renderer, "OutlineBlurShader", horizontal)
        this.blitMaterial = new Material(this.renderer, "blitOutlineBlur", outlineBlurShader)
        this.blitMaterial.uniforms.setTexture("inputTexture", this.renderer.texturesByLabel[inputTexture])

        this.blit = new Blit(this.renderer, 'blitOutlineBlur', this.blitMaterial)
    }

    draw() {

        this.blit.draw(this)


    }

}

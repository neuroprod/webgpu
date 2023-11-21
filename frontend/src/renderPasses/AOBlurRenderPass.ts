import RenderPass from "../lib/core/RenderPass";
import ColorAttachment from "../lib/textures/ColorAttachment";
import RenderTexture from "../lib/textures/RenderTexture";
import Material from "../lib/core/Material";
import Blit from "../lib/Blit";
import Renderer from "../lib/Renderer";
import {TextureFormat} from "../lib/WebGPUConstants";

import AOShader from "../shaders/AOShader";
import UI from "../lib/UI/UI";
import AOBlurShader from "../shaders/AOBlurShader";

export default class AOBlurRenderPass extends RenderPass{


    public colorAttachment: ColorAttachment;

    private target: RenderTexture;

    private blitMaterial: Material;
    private blit: Blit;


    constructor(renderer: Renderer) {

        super(renderer, "OABlurPass");
        this.target = new RenderTexture(renderer, "OABlurPass", {
            format: TextureFormat.R8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier:1,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment= new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];
        this.blitMaterial = new Material(this.renderer, "blitOABlur", new AOBlurShader(this.renderer, "aoBlur"))

        this.blitMaterial.uniforms.setTexture("aoTexture",this.renderer.texturesByLabel["OAPass"])

        this.blit = new Blit(renderer, 'blitAOBlur', this.blitMaterial)
    }
    onUI(){


    }
    draw() {

        this.blit.draw(this);


    }












}

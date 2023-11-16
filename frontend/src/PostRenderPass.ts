import RenderPass from "./lib/core/RenderPass";

import ColorAttachment from "./lib/textures/ColorAttachment";

import RenderTexture from "./lib/textures/RenderTexture";
import Material from "./lib/core/Material";
import Blit from "./lib/Blit";

import Renderer from "./lib/Renderer";
import {TextureFormat} from "./lib/WebGPUConstants";
import DebugTextureShader from "./shaders/DebugTextureShader";
import PostShader from "./shaders/PostShader";

export default class PostRenderPass extends RenderPass {
    public colorAttachment: ColorAttachment;

    private target: RenderTexture;

    private blitMaterial: Material;
    private blit: Blit;


    constructor(renderer: Renderer) {

        super(renderer, "PostPass");
        this.target = new RenderTexture(renderer, "PostPass", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment= new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];
        this.blitMaterial = new Material(this.renderer, "blitPost", new PostShader(this.renderer, "post"))
        this.blitMaterial.uniforms.setTexture("colorTexture",this.renderer.texturesByLabel["LightPass"])


        this.blit = new Blit(renderer, 'blitPost', this.blitMaterial)
    }
    draw() {

        this.blit.draw(this);


    }





}

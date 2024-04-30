import RenderPass from "../lib/core/RenderPass";
import ModelRenderer from "../lib/model/ModelRenderer";
import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import {LoadOp, StoreOp, TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";

export default class extends RenderPass {

    public modelRenderer: ModelRenderer;
    public colorTarget: RenderTexture;

    private colorAttachment: ColorAttachment;


    constructor(renderer: Renderer) {

        super(renderer, "pantsRenderPass");

        this.modelRenderer = new ModelRenderer(renderer)

        this.colorTarget = new RenderTexture(renderer, "PantsPass", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.colorTarget, {clearValue: {r: 0.0, g: 0.0, b: 0.0, a: 0.0}});
        this.colorAttachments = [this.colorAttachment]

        this.depthStencilAttachment = new DepthStencilAttachment(this.renderer.texturesByLabel["GDepth"] as RenderTexture, {
            depthLoadOp: LoadOp.Load,
            depthStoreOp: StoreOp.Store,

        });


    }

    onSettingsChange() {
        super.onSettingsChange();

    }

    draw() {

        this.modelRenderer.draw(this);


    }
}

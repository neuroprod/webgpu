import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import {TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";
import RenderPass from "../lib/core/RenderPass";
import Renderer from "../lib/Renderer";
import ModelRenderer from "../lib/model/ModelRenderer";
import DrawingRenderer from "../drawing/DrawingRenderer";


export default class extends RenderPass {

    public modelRenderer: ModelRenderer;
    public colorTarget: RenderTexture;
    public depthTarget: RenderTexture;
    public normalTarget: RenderTexture;
    public mraTarget: RenderTexture;
    private colorAttachment: ColorAttachment;
    private normalAttachment: ColorAttachment;
    private mraAttachment: ColorAttachment;
    drawingRenderer: DrawingRenderer;


    constructor(renderer: Renderer) {

        super(renderer, "GbufferRenderPass");

        this.modelRenderer = new ModelRenderer(renderer)
        this.drawingRenderer = new DrawingRenderer(renderer);
        this.colorTarget = new RenderTexture(renderer, "GColor", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.colorTarget);


        this.normalTarget = new RenderTexture(renderer, "GNormal", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.normalAttachment = new ColorAttachment(this.normalTarget);

        this.mraTarget = new RenderTexture(renderer, "GMRA", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.mraAttachment = new ColorAttachment(this.mraTarget, {clearValue: {r: 0.0, g: 1.0, b: 0.0, a: 1.0},});


        this.colorAttachments = [this.colorAttachment, this.normalAttachment, this.mraAttachment];


        this.depthTarget = new RenderTexture(renderer, "GDepth", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: 1,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.depthTarget);


    }

    draw() {

        this.modelRenderer.draw(this);
        if (this.drawingRenderer.drawings.length > 0) this.drawingRenderer.draw(this);

    }

}

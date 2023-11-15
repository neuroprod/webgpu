import RenderTexture from "./lib/textures/RenderTexture";
import ColorAttachment from "./lib/textures/ColorAttachment";
import {TextureFormat} from "./lib/WebGPUConstants";
import DepthStencilAttachment from "./lib/textures/DepthStencilAttachment";
import RenderPass from "./lib/core/RenderPass";
import Renderer from "./lib/Renderer";
import ModelRenderer from "./lib/model/ModelRenderer";



export default class extends RenderPass {

    public modelRenderer: ModelRenderer;
    public colorTarget: RenderTexture;
    public depthTarget: RenderTexture;
    public normalTarget: RenderTexture;
    public mraTarget: RenderTexture;
    private colorAttachment: ColorAttachment;
    private normalAttachment: ColorAttachment;
    private mraAttachment: ColorAttachment;
    private positionTarget: RenderTexture;
    private positionAttachment: ColorAttachment;


    constructor(renderer: Renderer) {

        super(renderer, "GbufferRenderPass");

        this.modelRenderer = new ModelRenderer(renderer)

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
        this.mraAttachment = new ColorAttachment(this.mraTarget);



        this.positionTarget = new RenderTexture(renderer, "GPosition", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.positionAttachment = new ColorAttachment(this.positionTarget);

        this.colorAttachments = [this.colorAttachment, this.normalAttachment, this.mraAttachment, this.positionAttachment];


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


    }

}

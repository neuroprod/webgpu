import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import {TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";
import RenderPass from "../lib/core/RenderPass";
import Renderer from "../lib/Renderer";
import ModelRenderer from "../lib/model/ModelRenderer";



export default class ShadowPass extends RenderPass {

    public modelRenderer: ModelRenderer;
    private depthTarget: RenderTexture;





    constructor(renderer: Renderer) {

        super(renderer, "ShadowPass");

        this.modelRenderer = new ModelRenderer(renderer)


        this.depthTarget = new RenderTexture(renderer, "ShadowDepth", {
            format: TextureFormat.Depth24Plus,
            sampleCount: 1,
            scaleToCanvas: false,
            width:256,
            height:256,
            depthOrArrayLayers:6,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.depthTarget);


    }

    draw() {

        this.modelRenderer.draw(this);


    }

}

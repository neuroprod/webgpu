import RenderTexture from "./lib/textures/RenderTexture";
import ColorAttachment from "./lib/textures/ColorAttachment";
import {TextureFormat} from "./lib/WebGPUConstants";
import DepthStencilAttachment from "./lib/textures/DepthStencilAttachment";
import RenderPass from "./lib/core/RenderPass";
import Renderer from "./lib/Renderer";
import ModelRenderer from "./lib/model/ModelRenderer";
import UI from "./lib/UI/UI";
import Blit from "./lib/Blit";
import Material from "./lib/core/Material";
import BlitShader from "./shaders/BlitShader";
import ImagePreloader from "./ImagePreloader";

export default class  extends RenderPass {
    private canvasColorTarget: RenderTexture;
    public canvasColorAttachment: ColorAttachment;
    private canvasDepthTarget: RenderTexture;
    public modelRenderer: ModelRenderer;
    private blitMaterial: Material;
    private blitTest: Blit;



    constructor(renderer:Renderer) {

        super(renderer,"canvasRenderPass");

        this.modelRenderer =new ModelRenderer(renderer)

        this.canvasColorTarget = new RenderTexture(renderer, "canvasColor", {
            format: renderer.presentationFormat,
            sampleCount: 4,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.canvasColorAttachment = new ColorAttachment(this.canvasColorTarget);
        this.colorAttachments =[this.canvasColorAttachment];

       this.canvasDepthTarget = new RenderTexture(renderer, "canvasDepth", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: 4,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.canvasDepthTarget);

        this.blitMaterial =new Material(this.renderer,"blit", new BlitShader(this.renderer,"blit"))
        this.blitMaterial.uniforms.setTexture("colorTexture",ImagePreloader.getTexture("chair_Color"))
        this.blitTest =new Blit(renderer,'blit',this.blitMaterial)


    }
    draw() {
        this.blitTest.draw(this);
        this.modelRenderer.draw(this);

        UI.drawGPU(this.passEncoder,true)
    }

}

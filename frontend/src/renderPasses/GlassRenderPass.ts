import RenderPass from "../lib/core/RenderPass";
import ModelRenderer from "../lib/model/ModelRenderer";
import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import {LoadOp, StoreOp, TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";
import RenderSettings from "../RenderSettings";

export default class extends RenderPass {

    public modelRenderer: ModelRenderer;
    public colorTarget: RenderTexture;

    private colorAttachment: ColorAttachment;


    constructor(renderer: Renderer) {

        super(renderer, "GlassRenderPass");
        RenderSettings.registerPass(this);
        this.modelRenderer = new ModelRenderer(renderer)

        this.colorTarget = new RenderTexture(renderer, "GlassPass", {
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
            depthReadOnly: true
        });


    }

    onSettingsChange() {
        super.onSettingsChange();
        for (let m of this.modelRenderer.models) {
            if (m.material.label.includes("_G")) {
                m.material.uniforms.setUniform("refSettings1", RenderSettings.ref_settings1)
                m.material.uniforms.setUniform("refSettings2", RenderSettings.ref_settings2)
            }
        }
    }

    draw() {

        this.modelRenderer.draw(this);


    }
}

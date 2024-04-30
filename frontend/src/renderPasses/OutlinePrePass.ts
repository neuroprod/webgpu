import RenderPass from "../lib/core/RenderPass";
import ModelRenderer from "../lib/model/ModelRenderer";
import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import RenderSettings from "../RenderSettings";
import {LoadOp, StoreOp, TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";
import Model from "../lib/model/Model";

export default class OutlinePrePass extends RenderPass {

    public modelRenderer: ModelRenderer;
    public colorTarget: RenderTexture;
    public models: Array<Model> = []
    private colorAttachment: ColorAttachment;
    // private material: Material;
    private depthTarget: RenderTexture;

    constructor(renderer: Renderer) {

        super(renderer, "OutlinePrePass");
        RenderSettings.registerPass(this);
        // this.material = new Material(this.renderer, "solidshaderOutline", new SolidShader(this.renderer, "solidShader"))

        // this.material.depthWrite =false;

        this.modelRenderer = new ModelRenderer(renderer)

        this.colorTarget = new RenderTexture(renderer, "OutlinePrePass", {
            format: TextureFormat.RG8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.colorTarget, {clearValue: {r: 0.0, g: 0.0, b: 0.0, a: 0.0}});
        this.colorAttachments = [this.colorAttachment]

        this.depthTarget = new RenderTexture(renderer, "OutlineDepth", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: 1,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });


        this.depthStencilAttachment = new DepthStencilAttachment(this.depthTarget, {
            depthLoadOp: LoadOp.Clear,
            depthStoreOp: StoreOp.Store,


        });


    }

    draw() {

        const passEncoder = this.passEncoder;

        passEncoder.setBindGroup(0, this.renderer.camera.bindGroup);

        for (let model of this.models) {

            model.materialSolid.makePipeLine(this);


            passEncoder.setPipeline(model.materialSolid.pipeLine);
            passEncoder.setBindGroup(1, model.modelTransform.bindGroup);
            passEncoder.setBindGroup(2, model.materialSolid.uniforms.bindGroup);

            for (let attribute of model.materialSolid.shader.attributes) {
                passEncoder.setVertexBuffer(
                    attribute.slot,
                    model.mesh.getBufferByName(attribute.name)
                );
            }


            if (model.mesh.hasIndices) {

                passEncoder.setIndexBuffer(model.mesh.indexBuffer, model.mesh.indexFormat);
                passEncoder.drawIndexed(
                    model.mesh.numIndices,
                    1,
                    0,
                    0
                );
            } else {
                passEncoder.draw(
                    model.mesh.numVertices,
                    1,
                    0,
                    0
                );
            }

        }


    }

}

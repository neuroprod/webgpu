import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import Model from "./Model";

import ColorAttachment from "../textures/ColorAttachment";
import DepthStencilAttachment from "../textures/DepthStencilAttachment";

export default class RenderPass extends ObjectGPU {
    public models: Array<Model>=[];
    protected renderPassDescriptor: GPURenderPassDescriptor;
    private colorAttachments: Array<ColorAttachment>;
    private depthStencilAttachment: DepthStencilAttachment;
    multiSampleCount: number =1;
    constructor(renderer: Renderer, label: string, colorAttachments:Array<ColorAttachment>|null=null, depthStencilAttachment:DepthStencilAttachment|null=null) {
        super(renderer, label);
        this.colorAttachments =colorAttachments;
        this.depthStencilAttachment=depthStencilAttachment;
    }
    draw(commandEncoder: GPUCommandEncoder) {
        this.updateDescriptor()
        const passEncoder = commandEncoder.beginRenderPass(
            this.renderPassDescriptor
        );

        this.drawModels(passEncoder);

        passEncoder.end();
    }
    private drawModels(passEncoder: GPURenderPassEncoder) {

        passEncoder.setBindGroup(0,this.renderer.camera.bindGroup);
        for (let model of this.models) {

            model.material.makePipeLine();

            passEncoder.setPipeline(model.material.pipeLine);
            passEncoder.setBindGroup(1,model.modelTransform.bindGroup);
            passEncoder.setBindGroup(2,model.material.uniforms.bindGroup);


            for (let attribute of model.material.shader.attributes) {
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
    public addModel(model: Model) {
       // model.renderPass =this;
        this.models.push(model);
    }


    private updateDescriptor() {
       let dirty =false;
        if(this.depthStencilAttachment && this.depthStencilAttachment.isDirty)
        {
            dirty =true;
        }
        for(let c of this.colorAttachments)
        {
            if(c.isDirty)dirty =true;
        }
        if(!dirty)return;

        this.renderPassDescriptor = {
            label: this.label,
            colorAttachments: [
                this.colorAttachments[0].getAttachment(),
            ],
        };
        if(this.depthStencilAttachment)
        this.renderPassDescriptor.depthStencilAttachment = this.depthStencilAttachment.getAttachment()


    }



    getMultisampleCount() {
        return this.multiSampleCount;
    }
}

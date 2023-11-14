import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import Model from "../model/Model";

import ColorAttachment from "../textures/ColorAttachment";
import DepthStencilAttachment from "../textures/DepthStencilAttachment";

export default class RenderPass extends ObjectGPU {

    protected renderPassDescriptor: GPURenderPassDescriptor;
    public colorAttachments: Array<ColorAttachment>;
    public depthStencilAttachment: DepthStencilAttachment;
    public passEncoder: GPURenderPassEncoder;

    constructor(renderer: Renderer, label: string) {
        super(renderer, label);

    }
    add() {
        this.updateDescriptor()

        this.passEncoder = this.renderer.commandEncoder.beginRenderPass(
            this.renderPassDescriptor
        );

        this.draw()


        this.passEncoder.end();
    }

    draw()
    {

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


}

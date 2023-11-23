import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import Model from "../model/Model";

import ColorAttachment from "../textures/ColorAttachment";
import DepthStencilAttachment from "../textures/DepthStencilAttachment";
import UI from "../UI/UI";

export default class RenderPass extends ObjectGPU {

    protected renderPassDescriptor: GPURenderPassDescriptor;
    public colorAttachments: Array<ColorAttachment>=[];
    public depthStencilAttachment: DepthStencilAttachment;
    public passEncoder: GPURenderPassEncoder;
    public sampleCount: 1|4 =1
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
    onSettingsChange(){

    }
    draw()
    {

    }



    private updateDescriptor() {
       let dirty =false;

        if(this.depthStencilAttachment && this.depthStencilAttachment.isDirty())
        {
            dirty =true;

        }
        for(let c of this.colorAttachments)
        {
            if(c.isDirty())dirty =true;

        }
        if(!dirty)return;

        let attachments = []
        for(let c of this.colorAttachments)
        {
            attachments.push(c.getAttachment())
        }


        this.renderPassDescriptor = {
            label: this.label,
            colorAttachments: attachments,
        };
        if(this.depthStencilAttachment)
        this.renderPassDescriptor.depthStencilAttachment = this.depthStencilAttachment.getAttachment()


    }


}

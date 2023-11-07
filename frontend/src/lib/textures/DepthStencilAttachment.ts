import RenderTexture from "./RenderTexture";
import {LoadOp, StoreOp} from "../WebGPUConstants";


export type DepthStencilAttachmentOptions = {
    depthClearValue: number;
    depthLoadOp: GPULoadOp;
    depthStoreOp: GPUStoreOp;
    depthReadOnly: boolean;
    stencilClearValue: GPUStencilValue;
    stencilLoadOp: GPULoadOp;
    stencilStoreOp: GPUStoreOp;
    stencilReadOnly: boolean;

}
export const DepthStencilAttachmentOptionsDefault: DepthStencilAttachmentOptions = {
    depthClearValue:  1,
    depthLoadOp: LoadOp.Clear,
    depthStoreOp: StoreOp.Store,
    depthReadOnly: false,
    stencilClearValue:  0,
    stencilLoadOp: LoadOp.Clear,
    stencilStoreOp: StoreOp.Store,
    stencilReadOnly:  false,
}
export default class DepthStencilAttachment {
    public options: DepthStencilAttachmentOptions
    private renderTexture: RenderTexture;

    constructor(renderTexture: RenderTexture, options: Partial<DepthStencilAttachmentOptions>=DepthStencilAttachmentOptionsDefault) {
        this.renderTexture =renderTexture;
        this.options = {...DepthStencilAttachmentOptionsDefault, ...options};
    }

    getAttachment():GPURenderPassDepthStencilAttachment{
        return{
            view:this.renderTexture.textureGPU.createView(),
            depthClearValue: this.options.depthClearValue,
            depthLoadOp:  this.options.depthLoadOp,
            depthStoreOp:  this.options.depthStoreOp,
            depthReadOnly:  this.options.depthReadOnly,
          /*  stencilClearValue:  this.options.stencilClearValue,
            stencilLoadOp:  this.options.stencilLoadOp,
            stencilStoreOp:  this.options.stencilStoreOp,
            stencilReadOnly:  this.options.stencilReadOnly,*/
        }

    }
    public isDirty():boolean
    {
        return this.renderTexture.isDirty;
    }
}

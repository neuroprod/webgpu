import RenderTexture from "./RenderTexture";
import {LoadOp, StoreOp} from "../WebGPUConstants";


export type ColorAttachmentOptions = {
    clearValue: GPUColor
    loadOp: GPULoadOp;
    storeOp: GPUStoreOp

}
export const ColorAttachmentOptionsDefault: ColorAttachmentOptions = {
    clearValue: {r: 0.0, g: 0.0, b: 0.0, a: 1.0},
    loadOp: LoadOp.Clear,
    storeOp: StoreOp.Store,
}
export default class ColorAttachment {
    public options: ColorAttachmentOptions
    private renderTexture: RenderTexture;
    private target: GPUTextureView =null;
    private dirty: boolean;

    constructor(renderTexture: RenderTexture, options: Partial<ColorAttachmentOptions>=ColorAttachmentOptionsDefault) {
        this.renderTexture =renderTexture;
        this.options = {...ColorAttachmentOptionsDefault, ...options};
    }
    setTarget(target:GPUTextureView){
        this.dirty =true;
        this.target =target;
    }
    getAttachment():GPURenderPassColorAttachment{
        return {
            view: this.renderTexture.textureGPU.createView(),
            resolveTarget: this.target,
            clearValue: this.options.clearValue,
            loadOp: this.options.loadOp,
            storeOp: this.options.storeOp,
        }
    }

    public isDirty():boolean
    {
        if(this.dirty)return true;
        return this.renderTexture.isDirty;
    }

}

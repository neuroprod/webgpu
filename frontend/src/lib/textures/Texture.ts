import Renderer from "../Renderer";
import ObjectGPU from "../core/ObjectGPU";
import {TextureDimension, TextureFormat} from "../WebGPUConstants";


export type TextureOptions = {
    width?: GPUIntegerCoordinate;
    height?: GPUIntegerCoordinate;
    depthOrArrayLayers?: GPUIntegerCoordinate;
    format?: GPUTextureFormat;
    sampleCount?: 1 | 4;
    mipLevelCount?: GPUIntegerCoordinate
    usage?: GPUTextureUsageFlags;
    dimension?: GPUTextureDimension;

}
export const TextureOptionsDefault: TextureOptions = {
    width: 1,
    height: 1,
    depthOrArrayLayers: 1,
    format: TextureFormat.RGBA8Unorm,
    usage: 16,
    sampleCount: 1,
    mipLevelCount: 1,
    dimension: TextureDimension.TwoD

}

export default class Texture extends ObjectGPU {
    public textureGPU!: GPUTexture;
    public options: TextureOptions;
    public isDirty: boolean = true;
    private view: GPUTextureView;
    public useCount = 0;

    constructor(renderer: Renderer, label: string = "", options: Partial<TextureOptions>) {
        super(renderer, label);

        this.options = {...TextureOptionsDefault, ...options};

        this.renderer.addTexture(this);

    }

    public make() {
        if (!this.isDirty) return
        if (this.textureGPU) this.textureGPU.destroy();
        let mipCount = this.options.mipLevelCount
        if (Math.pow(2, mipCount) > this.options.width) {
            mipCount = 1;

        }

        this.textureGPU = this.device.createTexture({
            label: this.label,
            size: [this.options.width, this.options.height, this.options.depthOrArrayLayers],
            sampleCount: this.options.sampleCount,
            format: this.options.format,
            usage: this.options.usage,
            mipLevelCount: mipCount,
            dimension: this.options.dimension,
            // viewformats:TextureV
        });

    }

    getView(descriptor: GPUTextureViewDescriptor = {}) {
        if (this.isDirty || this.view == undefined) {
            if (this.textureGPU == undefined) console.log(this.label, this["loaded"], this)
            this.view = this.textureGPU.createView(descriptor)
        }

        return this.view;
    }

    writeTexture(f: any, width: number, height: number, bytesPerRow: number, depthOrArrayLayers = 1) {
        this.renderer.device.queue.writeTexture(
            {texture: this.textureGPU},
            f,
            {bytesPerRow: bytesPerRow},
            [width, height, depthOrArrayLayers]
        );
    }
}

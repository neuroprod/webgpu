import Texture, {TextureOptions} from "./Texture";
import Renderer from "../Renderer";
import {TextureFormat} from "../WebGPUConstants";

export default class TextureLoader extends Texture {
    public loaded: boolean = false;

    onComplete = () => {
    }

    constructor(renderer: Renderer, preLoader, url: string = "", options: Partial<TextureOptions>, delay = 0) {
        super(renderer, url, options)
        preLoader.startLoad();
        this.options.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT;
        if (url.includes("_Op."))
            this.options.format = TextureFormat.R8Unorm

        this.make();

        setTimeout(() => {

            this.loadURL(url).then(() => {
                preLoader.stopLoad();
                this.onComplete();
            });
        }, delay)

    }

    async loadURL(url: string) {
        const response = await fetch(url);

        const imageBitmap = await createImageBitmap(await response.blob());
        this.options.width = imageBitmap.width;
        this.options.height = imageBitmap.height;
        if (this.options.mipLevelCount > Math.log2(imageBitmap.height) - 2) {
            this.options.mipLevelCount = Math.max(Math.log2(imageBitmap.height) - 2, 0);
            //    console.log(  this.options.mipLevelCount,imageBitmap.height )
        }

        //this.options.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT;
        this.isDirty = true;
        this.make();


        this.device.queue.copyExternalImageToTexture(
            {source: imageBitmap},
            {texture: this.textureGPU},
            [imageBitmap.width, imageBitmap.height]
        );

        this.renderer.mipmapQueue.addTexture(this)
        this.loaded = true;
    }

}

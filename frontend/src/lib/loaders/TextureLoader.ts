import Texture, {TextureOptions} from "../textures/Texture";
import Renderer from "../Renderer";

export default class TextureLoader extends Texture{
    constructor(renderer:Renderer,preLoader,url:string ="",options:  Partial<TextureOptions>) {
        super(renderer,url,options)
        preLoader.startLoad();
        this.loadURL(url).then(() => {
            preLoader.stopLoad();
        });
    }
    async loadURL(url: string) {
        const response = await fetch(url);
        const imageBitmap = await createImageBitmap(await response.blob());
        this.options.width = imageBitmap.width;
        this.options.height = imageBitmap.height;
        this.options.usage =  GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT ;
        this.make();


        this.device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: this.textureGPU },
            [imageBitmap.width, imageBitmap.height]
        );
        console.log("textureLoadeede");
    }

}

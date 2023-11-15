import Texture, {TextureOptions, TextureOptionsDefault} from "./Texture";
import Renderer from "../Renderer";


export type BaseRenderTextureOptions = TextureOptions & {
    scaleToCanvas: boolean
    sizeMultiplier: number
}
export const BaseRenderTextureOptionsDefault:BaseRenderTextureOptions = {
    ...TextureOptionsDefault,
    scaleToCanvas: false,
    sizeMultiplier : 1,
}


export default class RenderTexture extends Texture {
    private view: GPUTextureView;

    constructor(renderer: Renderer, label: string = "", options: Partial<BaseRenderTextureOptions>) {
        super(renderer, label, options);
        this.options = { ...BaseRenderTextureOptionsDefault,...options} ;

        if((this.options as BaseRenderTextureOptions).scaleToCanvas){
            this.renderer.addScaleToCanvasTexture(this);
        }
    }
    getView()
    {
        if(this.isDirty){
            this.view = this.textureGPU.createView()
        }
        return this.view;
    }
    resize(width,height)
    {

        let options=this.options as BaseRenderTextureOptions
        this.options.width =width*options.sizeMultiplier;
        this.options.height =height*options.sizeMultiplier;

        this.isDirty =true;
    }
}

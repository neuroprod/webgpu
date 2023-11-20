import Renderer from "../lib/Renderer";
import RenderTexture from "../lib/textures/RenderTexture";
import {TextureFormat} from "../lib/WebGPUConstants";
import KawasePass from "./KawasePass";
import RenderPass from "../lib/core/RenderPass";

export default class BlurLight {
    private renderer: Renderer;
    private numLevels = 8;
    private result: RenderTexture;
    private targetTextures: Array<RenderTexture> = []
    private passes: Array<RenderPass> = []

    constructor(renderer: Renderer) {
        this.renderer = renderer;

        let start = this.renderer.texturesByLabel["LightPass"] as RenderTexture
        this.result = new RenderTexture(renderer, "BlurLightPass",
            {
                scaleToCanvas: true, sizeMultiplier: 0.5, format: TextureFormat.RGBA16Float,
                mipLevelCount: this.numLevels,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
            })
        let scale = 1;
        this.targetTextures.push(start);
        for (let i = 0; i < this.numLevels; i++) {
            scale *= 0.5;
            let t = new RenderTexture(renderer, "BlurLightLevel" + i,
                {
                    scaleToCanvas: true,
                    sizeMultiplier: scale,
                    format: TextureFormat.RGBA16Float,
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC
                })
            this.targetTextures.push(t);
            let kawasePass = new KawasePass(renderer, t, this.targetTextures[i]);
            this.passes.push(kawasePass);
        }


    }

    public add() {
        for (let pass of this.passes) {
            pass.add();

        }
        for (let i = 0; i < this.numLevels; i++) {

            let source: GPUImageCopyTexture = {texture: this.targetTextures[i + 1].textureGPU};
            let w = this.targetTextures[i + 1].options.width;
            let h = this.targetTextures[i + 1].options.height;
            let dest: GPUImageCopyTexture = {texture: this.result.textureGPU, mipLevel: i};
            this.renderer.commandEncoder.copyTextureToTexture(source, dest, {
                width: w,
                height: h
            })
        }


    }


}

import Renderer from "../lib/Renderer";
import RenderTexture from "../lib/textures/RenderTexture";
import {TextureFormat} from "../lib/WebGPUConstants";
import KawasePass from "./KawasePass";
import RenderPass from "../lib/core/RenderPass";

export default class BlurBloom {
    private renderer: Renderer;
    private numLevels = 6;
    private result: RenderTexture;
    private targetTextures: Array<RenderTexture> = []
    private passes: Array<RenderPass> = []

    constructor(renderer: Renderer) {
        this.renderer = renderer;

        let start = this.renderer.texturesByLabel["BloomPrePass"] as RenderTexture
        this.result = new RenderTexture(renderer, "BlurBloomPass",
            {
                scaleToCanvas: true, sizeMultiplier: 0.5, format: TextureFormat.RGBA16Float,
                mipLevelCount: this.numLevels,
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
            })
        let scale = 1;
        this.targetTextures.push(start);
        for (let i = 0; i < this.numLevels; i++) {
            scale *= 0.5;
            let label = "BlurBloomLevel" + i;
            if (i == 0) {
                label = "BlurBloom";
            }
            let t = new RenderTexture(renderer, label,
                {
                    scaleToCanvas: true,
                    sizeMultiplier: scale,
                    format: TextureFormat.RGBA16Float,
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
                })
            this.targetTextures.push(t);
            let kawasePass = new KawasePass(renderer, t, this.targetTextures[i]);
            this.passes.push(kawasePass);
        }

        for (let i = this.numLevels - 1; i > 0; i--) {


            let kawasePass = new KawasePass(renderer, this.targetTextures[i], this.targetTextures[i + 1], false, true);
            this.passes.push(kawasePass);
        }

    }

    public add() {
        for (let pass of this.passes) {
            pass.add();

        }


    }


}

import RenderPass from "../core/RenderPass";
import ColorAttachment from "./ColorAttachment";
import Material from "../core/Material";
import Blit from "../Blit";
import Renderer from "../Renderer";
import RenderTexture from "./RenderTexture";
import Texture from "./Texture";
import MipMapShader from "./MipMapShader";

export default class MipMapRenderPass extends RenderPass {
    public colorAttachment: ColorAttachment;
    private blitMaterial: Material;
    private blit: Blit;
    public target: RenderTexture;


    constructor(renderer: Renderer, size: number, format: GPUTextureFormat) {

        super(renderer, "mipmapPass");

        this.target = new RenderTexture(renderer, "mipPrep" + size, {
            format: format,
            sampleCount: 1,
            scaleToCanvas: false,
            width: size,
            height: size,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC
        });
        this.target.make()
        this.colorAttachment = new ColorAttachment(this.target, {clearValue: {r: 1, g: 0, b: 0, a: 1}});

        this.colorAttachments = [this.colorAttachment];

        this.blitMaterial = new Material(this.renderer, "mipmap", new MipMapShader(this.renderer, "mipmap"))
        this.blit = new Blit(renderer, 'mip', this.blitMaterial)
    }

    public setInputTexture(input: Texture) {
        this.blitMaterial.uniforms.setTexture("inputTexture", input)
        this.blitMaterial.uniforms.update();
    }

    draw() {

        this.blit.draw(this);


    }


}

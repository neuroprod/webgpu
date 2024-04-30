import RenderPass from "../lib/core/RenderPass";
import ColorAttachment from "../lib/textures/ColorAttachment";
import RenderTexture from "../lib/textures/RenderTexture";
import Material from "../lib/core/Material";
import Blit from "../lib/Blit";
import Renderer from "../lib/Renderer";
import {TextureFormat} from "../lib/WebGPUConstants";
import DofShader from "../shaders/DofShader";
import RenderSettings from "../RenderSettings";


export default class DOFRenderPass extends RenderPass {
    public colorAttachment: ColorAttachment;
    private target: RenderTexture;
    public bloomAttachment: ColorAttachment;
    private bloomTarget: RenderTexture;
    private blitMaterial: Material;
    private blit: Blit;


    constructor(renderer: Renderer, targetName: string) {

        super(renderer, "DofPass");

        RenderSettings.registerPass(this);
        this.target = new RenderTexture(renderer, targetName, {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier: 1,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.target);


        this.colorAttachments = [this.colorAttachment];


    }

    init(horizontal: boolean, inputTexture: string) {

        let dofShader = new DofShader(this.renderer, "dofPass", horizontal)
        this.blitMaterial = new Material(this.renderer, "blitDof", dofShader)
        this.blitMaterial.uniforms.setTexture("inputTexture", this.renderer.texturesByLabel[inputTexture])

        this.blit = new Blit(this.renderer, 'blitDof', this.blitMaterial)
    }

    onSettingsChange() {
        super.onSettingsChange();

        this.blitMaterial.uniforms.setUniform("settings", RenderSettings.dof_Settings);

    }


    draw() {

        this.blit.draw(this);


    }
}

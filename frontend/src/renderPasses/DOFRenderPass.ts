import RenderPass from "../lib/core/RenderPass";
import ColorAttachment from "../lib/textures/ColorAttachment";
import RenderTexture from "../lib/textures/RenderTexture";
import Material from "../lib/core/Material";
import Blit from "../lib/Blit";
import Renderer from "../lib/Renderer";
import {TextureFormat} from "../lib/WebGPUConstants";
import DofShader from "../shaders/DofShader";
import RenderSettings from "../RenderSettings";



export default class DOFRenderPass extends RenderPass{
    public colorAttachment: ColorAttachment;
    private target: RenderTexture;
    public bloomAttachment: ColorAttachment;
    private bloomTarget: RenderTexture;
    private blitMaterial: Material;
    private blit: Blit;



    constructor(renderer: Renderer,targetName) {

        super(renderer, "DofPass");

        RenderSettings.registerPass(this);
        this.target = new RenderTexture(renderer, "DOFPass", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier:1,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment= new ColorAttachment(this.target);











    }
    init(){
        this.colorAttachments = [this.colorAttachment];
        this.blitMaterial = new Material(this.renderer, "blitDof", new DofShader(this.renderer, "dofPass"))
        this.blitMaterial.uniforms.setTexture("combineTexture",this.renderer.texturesByLabel["CombinePass"])

         this.blit = new Blit(this.renderer, 'blitCombine', this.blitMaterial)
}
    onSettingsChange() {
        super.onSettingsChange();

       // this.blitMaterial.uniforms.setUniform("threshold", RenderSettings.bloom_threshold);
       // this.blitMaterial.uniforms.setUniform("softThreshold", RenderSettings.bloom_softThreshold);
    }

 
    draw() {

        this.blit.draw(this);


    }
}

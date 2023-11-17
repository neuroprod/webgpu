import RenderPass from "./lib/core/RenderPass";
import ColorAttachment from "./lib/textures/ColorAttachment";
import RenderTexture from "./lib/textures/RenderTexture";
import Material from "./lib/core/Material";
import Blit from "./lib/Blit";
import Renderer from "./lib/Renderer";
import {TextureFormat} from "./lib/WebGPUConstants";

import AOShader from "./shaders/AOShader";
import UI from "./lib/UI/UI";

export default class AORenderPass extends RenderPass{


    public colorAttachment: ColorAttachment;

    private target: RenderTexture;

    private blitMaterial: Material;
    private blit: Blit;

    private aoRadius =1;
    private  aoStrength=1.3;
    private aoNumSamples =16;
    constructor(renderer: Renderer) {

        super(renderer, "OAPass");
        this.target = new RenderTexture(renderer, "OAPass", {
            format: TextureFormat.R8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier:0.5,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment= new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];
        this.blitMaterial = new Material(this.renderer, "blitOA", new AOShader(this.renderer, "ao"))
        this.blitMaterial.uniforms.setUniform("numSamples",this.aoNumSamples)
        this.blitMaterial.uniforms.setUniform("radius",this.aoRadius);
        this.blitMaterial.uniforms.setUniform("strength",this.aoStrength)
        this.blitMaterial.uniforms.setTexture("gNormal",this.renderer.texturesByLabel["GNormal"])
        this.blitMaterial.uniforms.setTexture("gDepth",this.renderer.texturesByLabel["GDepth"])

        this.blit = new Blit(renderer, 'blitAO', this.blitMaterial)
    }
    onUI(){
        UI.separator("SSAO")

        this.aoRadius =UI.LFloatSlider("radius",this.aoRadius,0.01,2)
        this.aoStrength = UI.LFloatSlider("strength",this.aoStrength,0,5)
        this.aoNumSamples =Math.round( UI.LFloatSlider("numSamples", this.aoNumSamples,1,64));
        this.blitMaterial.uniforms.setUniform("radius",this.aoRadius);
        this.blitMaterial.uniforms.setUniform("strength",this.aoStrength)
        this.blitMaterial.uniforms.setUniform("numSamples",this.aoNumSamples)
    }
    draw() {

        this.blit.draw(this);


    }












}

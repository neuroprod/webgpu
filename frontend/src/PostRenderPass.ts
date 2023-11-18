import RenderPass from "./lib/core/RenderPass";

import ColorAttachment from "./lib/textures/ColorAttachment";

import RenderTexture from "./lib/textures/RenderTexture";
import Material from "./lib/core/Material";
import Blit from "./lib/Blit";

import Renderer from "./lib/Renderer";
import {TextureFormat} from "./lib/WebGPUConstants";
import DebugTextureShader from "./shaders/DebugTextureShader";
import PostShader from "./shaders/PostShader";
import UI from "./lib/UI/UI";

export default class PostRenderPass extends RenderPass {
    public colorAttachment: ColorAttachment;

    private target: RenderTexture;

    private blitMaterial: Material;
    private blit: Blit;

    private exposure=1;
    private contrast =1;
    private brightness:number =0;
    private vibrance:number=0;
    private saturation:number =0
    private vin_falloff: number = 0.5;
    private vin_amount: number=0.4;
    constructor(renderer: Renderer) {

        super(renderer, "PostPass");
        this.target = new RenderTexture(renderer, "PostPass", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment= new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];

        this.blitMaterial = new Material(this.renderer, "blitPost", new PostShader(this.renderer, "post"))
        this.blitMaterial.uniforms.setTexture("colorTexture",this.renderer.texturesByLabel["LightPass"])
        this.blitMaterial.uniforms.setTexture("refTexture",this.renderer.texturesByLabel["ReflectionPass"])

        this.blitMaterial.uniforms.setUniform( "exposure",this.exposure);
        this.blitMaterial.uniforms.setUniform( "contrast" ,this.contrast);
        this.blitMaterial.uniforms.setUniform( "brightness",this.brightness);
        this.blitMaterial.uniforms.setUniform( "vibrance",this.vibrance);
        this.blitMaterial.uniforms.setUniform( "saturation",this.saturation)

        this.blit = new Blit(renderer, 'blitPost', this.blitMaterial)
    }
    onUI(){

        UI.separator("Post");
        this.exposure=UI.LFloatSlider("Exposure",this.exposure,0,10);
        this.brightness=UI.LFloatSlider("Brightness",this.brightness,-1,1);
        this.contrast=UI.LFloatSlider("Contrast",this.contrast,0,2);

        this.vibrance=UI.LFloatSlider("Vibrance",this.vibrance,-1,1);
        this.saturation=UI.LFloatSlider("Saturation",this.saturation,-1,1);

        UI.separator("Vignette");
        this.vin_amount=UI.LFloatSlider("Amount",this.vin_amount,0,1);
        this.vin_falloff=UI.LFloatSlider("Falloff",this.vin_falloff,0,1);




        this.blitMaterial.uniforms.setUniform( "falloff",this.vin_falloff);
        this.blitMaterial.uniforms.setUniform( "amount",this.vin_amount);

        this.blitMaterial.uniforms.setUniform( "exposure",this.exposure);
        this.blitMaterial.uniforms.setUniform( "contrast" ,this.contrast);
        this.blitMaterial.uniforms.setUniform( "brightness",this.brightness);
        this.blitMaterial.uniforms.setUniform( "vibrance",this.vibrance);
        this.blitMaterial.uniforms.setUniform( "saturation",this.saturation)
    }
    draw() {

        this.blit.draw(this);


    }





}

import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import {TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";
import RenderPass from "../lib/core/RenderPass";
import Renderer from "../lib/Renderer";
import ModelRenderer from "../lib/model/ModelRenderer";
import UI from "../lib/UI/UI";
import Blit from "../lib/Blit";
import Material from "../lib/core/Material";
import DebugTextureShader from "../shaders/DebugTextureShader";
import SelectItem from "../lib/UI/math/SelectItem";
import {Vector2} from "math.gl";
import PostShader from "../shaders/PostShader";
import RenderSettings from "../RenderSettings";


export default class CanvasRenderPass extends RenderPass {
    public canvasColorAttachment: ColorAttachment;
    public modelRenderer: ModelRenderer;
    private canvasColorTarget: RenderTexture;
    private canvasDepthTarget: RenderTexture;
    private blitMaterial: Material;
    private blitTest: Blit;

    private passSelect: Array<SelectItem> = []
    private currentValue = {texture: "kka", type: 0}
    private blitTestMaterial: Material;
    private blitFinal: Blit;




    private renderTest: boolean =false;
    constructor(renderer: Renderer) {

        super(renderer, "canvasRenderPass");
        RenderSettings.registerPass(this);
        this.sampleCount = 4

        this.modelRenderer = new ModelRenderer(renderer)

        this.canvasColorTarget = new RenderTexture(renderer, "canvasColor", {
            format: renderer.presentationFormat,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.canvasColorAttachment = new ColorAttachment(this.canvasColorTarget);
        this.colorAttachments = [this.canvasColorAttachment];

        this.canvasDepthTarget = new RenderTexture(renderer, "canvasDepth", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.canvasDepthTarget);

        this.blitTestMaterial = new Material(this.renderer, "blit", new DebugTextureShader(this.renderer, "blit"))



        this.blitTest = new Blit(renderer, 'blit', this.blitTestMaterial)



        this.passSelect.push(new SelectItem("Final", {texture: "final", type: 0}));
        this.passSelect.push(new SelectItem("BlurBloom", {texture: "BlurBloom", type: 0}));
        this.passSelect.push(new SelectItem("PreBloom", {texture: "BloomPrePass", type: 0}));
        this.passSelect.push(new SelectItem("Combine", {texture: "CombinePass", type: 0}));
        this.passSelect.push(new SelectItem("SSR", {texture: "ReflectionPass", type: 0}));
        this.passSelect.push(new SelectItem("Glass", {texture: "GlassPass", type: 0}));
        this.passSelect.push(new SelectItem("Light", {texture: "LightPass", type: 0}));
        this.passSelect.push(new SelectItem("OABlur", {texture: "OABlurPass", type: 1}));
        this.passSelect.push(new SelectItem("SSOA", {texture: "OAPass", type: 1}));
     //   this.passSelect.push(new SelectItem("ref", {texture: "ReflectionPass", type: 4}));
        this.passSelect.push(new SelectItem("Metallic", {texture: "GMRA", type: 1}));
        this.passSelect.push(new SelectItem("Roughness", {texture: "GMRA", type: 2}));
        this.passSelect.push(new SelectItem("Emission", {texture: "GMRA", type: 3}));
        this.passSelect.push(new SelectItem("GColor", {texture: "GColor", type: 0}));
        this.passSelect.push(new SelectItem("GNormal", {texture: "GNormal", type: 0}));
        this.passSelect.push(new SelectItem("GDepth", {texture: "GDepth", type: 0}));
        this.passSelect.push(new SelectItem("GMRE", {texture: "GMRA", type: 0}));

        let value = this.passSelect[0].value;
        this.currentValue = value;


        if(value.texture =="final"){
            this.renderTest =false;
        }else {
            this.renderTest =true;
            let texture = this.renderer.texturesByLabel[value.texture] as RenderTexture;
            this.blitTestMaterial.uniforms.setTexture("colorTexture", texture)
            this.blitTestMaterial.uniforms.setUniform("rtype", value.type)
        }








        this.blitMaterial = new Material(this.renderer, "blitPost", new PostShader(this.renderer, "post"))
        this.blitMaterial.uniforms.setTexture("colorTexture",this.renderer.texturesByLabel["CombinePass"])
        this.blitMaterial.uniforms.setTexture("bloomTexture",this.renderer.texturesByLabel["BlurBloom"])



        this.blitFinal = new Blit(renderer, 'blitPost', this.blitMaterial)



    }
    onSettingsChange() {
        super.onSettingsChange();
        this.blitMaterial.uniforms.setUniform( "exposure",RenderSettings.exposure);
        this.blitMaterial.uniforms.setUniform( "contrast" ,RenderSettings.contrast);
        this.blitMaterial.uniforms.setUniform( "brightness",RenderSettings.brightness);
        this.blitMaterial.uniforms.setUniform( "vibrance",RenderSettings.vibrance);
        this.blitMaterial.uniforms.setUniform( "saturation",RenderSettings.saturation)

        this.blitMaterial.uniforms.setUniform( "falloff",RenderSettings.vin_falloff);
        this.blitMaterial.uniforms.setUniform( "amount",RenderSettings.vin_amount);
        this.blitMaterial.uniforms.setUniform( "bloom_strength",RenderSettings.bloom_strength);
    }

    onUI() {
        let value = UI.LSelect("pass", this.passSelect)
        if (value != this.currentValue) {
            this.currentValue = value;
            if(value.texture =="final"){
                this.renderTest =false;
            }else {
                this.renderTest =true;
                let texture = this.renderer.texturesByLabel[value.texture] as RenderTexture;
                this.blitTestMaterial.uniforms.setTexture("colorTexture", texture)
                this.blitTestMaterial.uniforms.setUniform("rtype", value.type)
            }
        }

    }

    draw() {

if(this.renderTest){
    this.blitTest.draw(this);
}
       else{
           this.blitFinal.draw(this);
}
        UI.drawGPU(this.passEncoder, true)
    }

}

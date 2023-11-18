import RenderTexture from "./lib/textures/RenderTexture";
import ColorAttachment from "./lib/textures/ColorAttachment";
import {TextureFormat} from "./lib/WebGPUConstants";
import DepthStencilAttachment from "./lib/textures/DepthStencilAttachment";
import RenderPass from "./lib/core/RenderPass";
import Renderer from "./lib/Renderer";
import ModelRenderer from "./lib/model/ModelRenderer";
import UI from "./lib/UI/UI";
import Blit from "./lib/Blit";
import Material from "./lib/core/Material";
import DebugTextureShader from "./shaders/DebugTextureShader";
import SelectItem from "./lib/UI/math/SelectItem";
import {Vector2} from "math.gl";


export default class CanvasRenderPass extends RenderPass {
    public canvasColorAttachment: ColorAttachment;
    public modelRenderer: ModelRenderer;
    private canvasColorTarget: RenderTexture;
    private canvasDepthTarget: RenderTexture;
    private blitMaterial: Material;
    private blitTest: Blit;

    private passSelect: Array<SelectItem> = []
    private currentValue = {texture: "kka", type: 0}

    constructor(renderer: Renderer) {

        super(renderer, "canvasRenderPass");
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

        this.blitMaterial = new Material(this.renderer, "blit", new DebugTextureShader(this.renderer, "blit"))



        this.blitTest = new Blit(renderer, 'blit', this.blitMaterial)
        this.passSelect.push(new SelectItem("Post", {texture: "PostPass", type: 0}));

        this.passSelect.push(new SelectItem("SSR", {texture: "ReflectionPass", type: 0}));

        this.passSelect.push(new SelectItem("SSOA", {texture: "OAPass", type: 0}));
        this.passSelect.push(new SelectItem("OABlur", {texture: "OABlurPass", type: 0}));
        this.passSelect.push(new SelectItem("Light", {texture: "LightPass", type: 0}));
        this.passSelect.push(new SelectItem("GColor", {texture: "GColor", type: 0}));
        this.passSelect.push(new SelectItem("GMRE", {texture: "GMRA", type: 0}));
        this.passSelect.push(new SelectItem("GNormal", {texture: "GNormal", type: 0}));


        this.passSelect.push(new SelectItem("GDepth", {texture: "GDepth", type: 0}));

        let value = this.passSelect[0].value;
        this.currentValue = value;
        let texture = this.renderer.texturesByLabel[value.texture] as RenderTexture;
        this.blitMaterial.uniforms.setTexture("colorTexture", texture)
        this.blitMaterial.uniforms.setUniform("textureSize", new Vector2(texture.options.width, texture.options.height))

    }

    onUI() {
        let value = UI.LSelect("pass", this.passSelect)
        if (value != this.currentValue) {
            this.currentValue = value;

            let texture = this.renderer.texturesByLabel[value.texture] as RenderTexture;
            this.blitMaterial.uniforms.setTexture("colorTexture", texture)

        }

    }

    draw() {


        this.blitTest.draw(this);
        UI.drawGPU(this.passEncoder, true)
    }

}

import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import {TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";
import RenderPass from "../lib/core/RenderPass";
import Renderer from "../lib/Renderer";
import UI from "../lib/UI/UI";
import Blit from "../lib/Blit";
import Material from "../lib/core/Material";
import DebugTextureShader from "../shaders/DebugTextureShader";
import SelectItem from "../lib/UI/math/SelectItem";

import RenderSettings from "../RenderSettings";

import FontMeshRenderer from "../lib/text/FontMeshRenderer";
import GameModel from "../../public/GameModel";
import DefaultTextures from "../lib/textures/DefaultTextures";


export default class CanvasRenderPass extends RenderPass {
    public canvasColorAttachment: ColorAttachment;

    private canvasColorTarget: RenderTexture;
    private canvasDepthTarget: RenderTexture;
    private blitTest: Blit;
    private passSelect: Array<SelectItem> = []
    private currentValue = {texture: "kka", type: 0}
    private blitTestMaterial: Material;
    private renderTest: boolean = false;
    fontMeshRenderer: FontMeshRenderer;

    constructor(renderer: Renderer) {

        super(renderer, "canvasRenderPass");
        RenderSettings.registerPass(this);
        this.sampleCount = 4


        this.canvasColorTarget = new RenderTexture(renderer, "canvasColor", {
            format: renderer.presentationFormat,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.canvasColorAttachment = new ColorAttachment(this.canvasColorTarget, {
            clearValue: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            }
        });
        this.colorAttachments = [this.canvasColorAttachment];

        this.canvasDepthTarget = new RenderTexture(renderer, "canvasDepth", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.canvasDepthTarget);

        this.blitTestMaterial = new Material(this.renderer, "blit", new DebugTextureShader(this.renderer, "blit"))

        DefaultTextures.getMagicNoise(renderer)
        this.blitTest = new Blit(renderer, 'blit', this.blitTestMaterial)
        // this.passSelect.push(new SelectItem("Magic", {texture: "magicNoise", type: 1}));

        this.passSelect.push(new SelectItem("Final", {texture: "FXAAPass", type: 0}));
        this.passSelect.push(new SelectItem("PantsPass", {texture: "PantsPass", type: 0}));
        ///this.passSelect.push(new SelectItem("Magic", {texture: "magicNoise", type: 0}));
        this.passSelect.push(new SelectItem("SSAO", {texture: "GTAO", type: 1}));
        this.passSelect.push(new SelectItem("SSAOdenoise", {texture: "GTAOdenoise", type: 1}));

        this.passSelect.push(new SelectItem("SSR", {texture: "ReflectionPass", type: 0}));

        this.passSelect.push(new SelectItem("Transparent", {texture: "GlassPass", type: 0}));
        this.passSelect.push(new SelectItem("Light", {texture: "LightPass", type: 0}));

        this.passSelect.push(new SelectItem("BlurBloom", {texture: "BlurBloom", type: 0}));
        this.passSelect.push(new SelectItem("PreBloom", {texture: "BloomPrePass", type: 0}));

        this.passSelect.push(new SelectItem("Metallic", {texture: "GMRA", type: 1}));
        this.passSelect.push(new SelectItem("Roughness", {texture: "GMRA", type: 2}));
        this.passSelect.push(new SelectItem("Emission", {texture: "GMRA", type: 3}));


        this.passSelect.push(new SelectItem("OutlinePrePass", {texture: "OutlinePrePass", type: 0}));
        this.passSelect.push(new SelectItem("OutlineBlur", {texture: "OutlineBlur", type: 0}));

        this.passSelect.push(new SelectItem("Combine", {texture: "CombinePass", type: 0}));
        this.passSelect.push(new SelectItem("Post", {texture: "PostPass", type: 0}));
        this.passSelect.push(new SelectItem("DoF ", {texture: "DOF", type: 0}));
        this.passSelect.push(new SelectItem("DoF filter", {texture: "CombinePass", type: 4}));

        this.passSelect.push(new SelectItem("Shadow1 Outside", {texture: "Shadow1", type: 0}));
        this.passSelect.push(new SelectItem("Shadow2 Outside", {texture: "Shadow2", type: 0}));


        this.passSelect.push(new SelectItem("GColor", {texture: "GColor", type: 0}));
        this.passSelect.push(new SelectItem("GNormal", {texture: "GNormal", type: 0}));
        this.passSelect.push(new SelectItem("GDepth", {texture: "GDepth", type: 0}));
        this.passSelect.push(new SelectItem("GMRE", {texture: "GMRA", type: 0}));

        let value = this.passSelect[0].value;
        this.currentValue = value;


        if (value.texture == "final") {
            this.renderTest = false;
        } else {
            this.renderTest = true;
            let texture = this.renderer.texturesByLabel[value.texture] as RenderTexture;
            this.blitTestMaterial.uniforms.setTexture("colorTexture", texture)
            this.blitTestMaterial.uniforms.setUniform("rtype", value.type)
        }


        this.fontMeshRenderer = new FontMeshRenderer(renderer, "fontMeshRenderer")


    }

    onSettingsChange() {
        super.onSettingsChange();

    }

    onUI() {
        let value = UI.LSelect("Render Pass", this.passSelect)
        if (value != this.currentValue) {
            this.currentValue = value;

            let texture = this.renderer.texturesByLabel[value.texture] as RenderTexture;
            this.blitTestMaterial.uniforms.setTexture("colorTexture", texture)
            this.blitTestMaterial.uniforms.setUniform("rtype", value.type)

        }

    }

    draw() {


        this.blitTest.draw(this);

        this.fontMeshRenderer.draw(this);
        GameModel.gameUI.modelRenderer.draw(this);
        UI.drawGPU(this.passEncoder, true)
    }

}

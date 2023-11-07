import Texture from "./textures/Texture";
import Material from "./core/Material";

import RenderTexture from "./textures/RenderTexture";
import RenderPass from "./core/RenderPass";

import ColorAttachment from "./textures/ColorAttachment";
import {TextureFormat} from "./WebGPUConstants";
import DepthStencilAttachment from "./textures/DepthStencilAttachment";
import UniformGroup from "./core/UniformGroup";
import Camera from "./Camera";
import Model from "./core/Model";

export default class Renderer {
    public device: GPUDevice;
    public mainRenderPass: RenderPass;
    public ratio: number;
    public camera: Camera;
    private context: GPUCanvasContext;
    private presentationFormat: GPUTextureFormat;
    private useTimeStampQuery: boolean = false;
    private canvas: HTMLCanvasElement;
    private width: number = 1;
    private height: number = 1;
    private materials: Array<Material> = [];
    private textures: Array<Texture> = [];
    private models: Array<Model> = [];
    private scaleToCanvasTextures: Array<RenderTexture> = [];
    private uniformGroups: Array<UniformGroup> = [];
    private canvasColorTarget: RenderTexture;
    private canvasColorAttachment: ColorAttachment;
    private canvasDepthTarget: RenderTexture;
    private canvasDepthAttachment: DepthStencilAttachment;

    constructor() {
    }

    async setup(canvas: HTMLCanvasElement, needsDepth: boolean = true) {
        this.canvas = canvas;
        const adapter = await navigator.gpu.requestAdapter();
        //--disable-dawn-features=disallow_unsafe_apis
        // on mac: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-dawn-features=disallow_unsafe_apis
        ///https://omar-shehata.medium.com/how-to-use-webgpu-timestamp-query-9bf81fb5344a test this

        const requiredFeatures: Array<GPUFeatureName> = ["rg11b10ufloat-renderable"];
        if (adapter.features.has('timestamp-query')) {
            requiredFeatures.push('timestamp-query');
            this.useTimeStampQuery = true;
        }
        //extentions
        for (let a of adapter.features.keys()) {
            console.log(a)
        }
        this.device = await adapter.requestDevice({requiredFeatures: requiredFeatures,});

        this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            format: this.presentationFormat,
            alphaMode: "premultiplied",
        });


    }

    init() {

        this.canvasColorTarget = new RenderTexture(this, "canvasColor", {
            format: this.presentationFormat,
            sampleCount: 4,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.canvasColorAttachment = new ColorAttachment(this.canvasColorTarget);


        this.canvasDepthTarget = new RenderTexture(this, "canvasDepth", {
            format: TextureFormat.Depth24Plus,
            sampleCount: 4,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.canvasDepthAttachment = new DepthStencilAttachment(this.canvasDepthTarget);


        this.mainRenderPass = new RenderPass(this, "canvasRenderPass", [this.canvasColorAttachment], this.canvasDepthAttachment);

    }

    public draw() {
        this.updateSize();
        this.updateModels();
        this.updateUniformGroups();


        //
        let canvasTextureView = this.context.getCurrentTexture().createView();
        this.canvasColorAttachment.setTarget(canvasTextureView)

        const commandEncoder = this.device.createCommandEncoder();

        this.mainRenderPass.draw(commandEncoder)

        this.device.queue.submit([commandEncoder.finish()]);
        for (let t of this.textures) {
            t.isDirty = false;
        }
    }

    updateModels() {
        for (let m of this.models) {
            m.update();
        }
    }

    addTexture(texture: Texture) {
        this.textures.push(texture);
    }

    addModel(model: Model) {
        this.models.push(model)
    }

    addMaterial(material: Material) {
        this.materials.push(material)
    }

    addScaleToCanvasTexture(texture: RenderTexture) {
        this.scaleToCanvasTextures.push(texture);
    }


    addUniformGroup(uniformGroup: UniformGroup) {
        this.uniformGroups.push(uniformGroup)
    }

    private updateSize() {
        if (this.width != this.canvas.width || this.height != this.canvas.height) {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.ratio = this.width / this.height;
            for (let t of this.scaleToCanvasTextures) {
                t.resize(this.width, this.height);
            }
        }
        for (let t of this.scaleToCanvasTextures) {
            t.make()

        }
    }

    private updateUniformGroups() {
        for (let u of this.uniformGroups) {
            u.update()
        }
    }
}


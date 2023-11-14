import Texture from "./textures/Texture";
import Material from "./core/Material";

import RenderTexture from "./textures/RenderTexture";


import ColorAttachment from "./textures/ColorAttachment";

import UniformGroup from "./core/UniformGroup";
import Camera from "./Camera";
import Model from "./model/Model";

export default class Renderer {
    public device: GPUDevice;

    public ratio: number;
    public camera: Camera;
    private context: GPUCanvasContext;
    presentationFormat: GPUTextureFormat;
    public useTimeStampQuery: boolean = false;
    private canvas: HTMLCanvasElement;
    public width: number = 1;
    public height: number = 1;
    private materials: Array<Material> = [];
    private textures: Array<Texture> = [];
    private models: Array<Model> = [];
    private scaleToCanvasTextures: Array<RenderTexture> = [];
    private uniformGroups: Array<UniformGroup> = [];

    private canvasColorAttachment: ColorAttachment;

    commandEncoder: GPUCommandEncoder;

    constructor() {
    }

    async setup(canvas: HTMLCanvasElement, needsDepth: boolean = true) {
        this.canvas = canvas;
        const adapter = await navigator.gpu.requestAdapter();
        //--enable-dawn-features=allow_unsafe_apis
        // on mac: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --enable-dawn-features=allow_unsafe_apis


        const requiredFeatures: Array<GPUFeatureName> = ["rg11b10ufloat-renderable"];
        if (adapter.features.has('timestamp-query')) {
            requiredFeatures.push('timestamp-query');
            this.useTimeStampQuery = true;

        }
        //extentions
        for (let a of adapter.features.keys()) {
            console.log(a)
        }
        console.log("timestamps?", this.useTimeStampQuery)
        this.device = await adapter.requestDevice({requiredFeatures: requiredFeatures,});

        this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            format: this.presentationFormat,
            alphaMode: "premultiplied",
        });



            this.ratio = this.canvas.width / this.canvas.height;
    }

    init() {

    }
    public setCanvasColorAttachment(canvasColorAttachment: ColorAttachment)
    {
        this.canvasColorAttachment =canvasColorAttachment
    }
    public update(setCommands: () => void) {
        this.updateSize();
        this.updateModels();
        this.updateUniformGroups();


        //
        let canvasTextureView = this.context.getCurrentTexture().createView();
        this.canvasColorAttachment.setTarget(canvasTextureView)


        this.commandEncoder = this.device.createCommandEncoder();




        setCommands();

        //this.mainRenderPass.draw(commandEncoder)

        this.device.queue.submit([this.commandEncoder.finish()]);
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


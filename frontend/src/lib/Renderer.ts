import Texture from "./textures/Texture";
import Material from "./core/Material";

import RenderTexture, {BaseRenderTextureOptions} from "./textures/RenderTexture";


import ColorAttachment from "./textures/ColorAttachment";

import UniformGroup from "./core/UniformGroup";
import Camera from "./Camera";
import Model from "./model/Model";
import {IResizable} from "./IResizable";
import {Vector2} from "math.gl";
import Skin from "./animation/Skin";
import MipMapQueue from "./textures/MipMapQueue";
import Object3D from "./core/Object3D";
import UIData from "../UIData";

export default class Renderer {
    public device: GPUDevice;

    public ratio: number = 1;
    public camera: Camera;
    presentationFormat: GPUTextureFormat;
    public useTimeStampQuery: boolean = false;
    canvas: HTMLCanvasElement;
    public width: number = 1;
    public height: number = 1;
    public size = new Vector2(1, 1);
    public texturesByLabel: { [label: string]: Texture } = {};
    commandEncoder: GPUCommandEncoder;
    private context: GPUCanvasContext;
    private materials: Array<Material> = [];
    public textures: Array<Texture> = [];
    models: Array<Model> = [];
    public modelByLabel: { [label: string]: Model } = {};
    public modelLabels: Array<string> = [];
    private scaleToCanvasTextures: Array<RenderTexture> = [];
    private uniformGroups: Array<UniformGroup> = [];
    private canvasColorAttachment: ColorAttachment;
    private canvasTextureView: GPUTexture;
    private first: boolean = true;
    private resizables: Array<IResizable> = [];
    public pixelRatio: number;
    public skin: Skin;
    public mipmapQueue: MipMapQueue
    selectedUIObject: Object3D;
    private factor: number =1;

    constructor() {
    }

    async setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const adapter = await navigator.gpu.requestAdapter({powerPreference: "high-performance"});
        //--enable-dawn-features=allow_unsafe_apis
        // on mac: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --enable-dawn-features=allow_unsafe_apis
        this.pixelRatio = window.devicePixelRatio;

        const requiredFeatures: Array<GPUFeatureName> = ["rg11b10ufloat-renderable", "float32-filterable"];
        if (adapter.features.has('timestamp-query')) {
            if (UIData.useTimestamp) {
                requiredFeatures.push('timestamp-query');
                this.useTimeStampQuery = true;
            }

        }
        //TEXTURE_ADAPTER_SPECIFIC_FORMAT_FEATURES
        //  console.log(adapter.limits)
        //extentions
        for (let a of adapter.features.keys()) {
            console.log(a)
        }
        console.log(window.devicePixelRatio)
        //console.log("timestamps?", this.useTimeStampQuery)
        //let limits={
        //  maxUniformBufferBindingSize: Math.pow(2,18)
        //} //=adapter.limits
        //limits.maxUniformBufferBindingSize = limits.maxUniformBufferBindingSize*2

        this.device = await adapter.requestDevice({requiredFeatures: requiredFeatures});
        console.log(this.device)
        this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        this.context.configure({
            device: this.device,
            format: this.presentationFormat,
            alphaMode: "premultiplied",

        });

        this.mipmapQueue = new MipMapQueue(this)
        //this.ratio = this.canvas.width / this.canvas.height;
    }


    public setCanvasColorAttachment(canvasColorAttachment: ColorAttachment) {
        this.canvasColorAttachment = canvasColorAttachment
    }

    public update(setCommands: () => void) {
        this.updateSize();
        this.updateModels();
        this.updateUniformGroups();


        //

        this.canvasTextureView = this.context.getCurrentTexture();

        this.first = false;
        this.canvasColorAttachment.setTarget(this.canvasTextureView.createView())


        this.commandEncoder = this.device.createCommandEncoder();

        this.mipmapQueue.processQue();

        setCommands();


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
        this.texturesByLabel[texture.label] = texture;
    }

    addModel(model: Model) {
        this.models.push(model)
        this.modelByLabel[model.label] = model;
        this.modelLabels.push(model.label);
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

    forceRescaleTextures() {
        for (let t of this.scaleToCanvasTextures) {
            if (t.label == "canvasColor" || t.label == "canvasDepth") {
                t.resize(this.width, this.height);
            } else {
                t.resize(this.width/this.factor , this.height/this.factor );
            }

        }
        this.notifyResizables()
        for (let t of this.scaleToCanvasTextures) {
            t.make()

        }
    }

    private updateSize() {
        //this.pixelRatio =1;
        if (this.width != this.canvas.width || this.height != this.canvas.height) {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.ratio = this.width / this.height;
            this.size.x = this.width;
            this.size.y = this.height;
            for (let t of this.scaleToCanvasTextures) {
                if (t.label == "canvasColor" || t.label == "canvasDepth") {
                    t.resize(this.width, this.height);
                } else {
                    let op = t.options as BaseRenderTextureOptions
                    t.resize(this.width /this.factor , this.height/this.factor);
                }
            }
            this.notifyResizables()
            for (let t of this.scaleToCanvasTextures) {
                t.make()

            }
        }

    }

    private updateUniformGroups() {
        for (let u of this.uniformGroups) {
            u.update()
        }
    }

    public registerResizable(r: IResizable) {
        this.resizables.push(r)
        r.onScreenResize(this.size)
    }

    private notifyResizables() {
        for (let a of this.resizables) {
            a.onScreenResize(this.size)
        }
    }


    removeModel(model: Model) {

        let index = this.models.indexOf(model)
        if (index >= 0)
            this.models = this.models.splice(index, 1)
        // this.models.push(model)
        this.modelByLabel[model.label] = null

        index = this.modelLabels.indexOf(model.label)
        if (index >= 0)
            this.modelLabels = this.modelLabels.splice(index, 1)
        //this.modelLabels.push(model.label);
    }

    setLowPerformance() {
        this.factor =this.pixelRatio;
        this.forceRescaleTextures()

    }
    setHighPerformance() {
        this.factor =1;
        this.forceRescaleTextures()

    }
}


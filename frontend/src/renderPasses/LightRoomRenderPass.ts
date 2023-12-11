import RenderPass from "../lib/core/RenderPass";
import ModelRenderer from "../lib/model/ModelRenderer";
import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import {LoadOp, StoreOp, TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";

import Material from "../lib/core/Material";

import {Vector3} from "math.gl";

import UI from "../lib/UI/UI";
import PointLight from "./PointLight";

import Blit from "../lib/Blit";
import GlobalLightInsideShader from "../shaders/GlobalLightInsideShader";
import ColorV from "../lib/ColorV";
import {saveToJsonFile} from "../lib/SaveUtils";
import MainLight from "../MainLight";
import Object3D from "../lib/core/Object3D";

export default class LightRoomRenderPass extends RenderPass {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;
    private modelRenderer: ModelRenderer

    private lights: Array<PointLight> = []
    private currentLight!: PointLight
    private globalLightMaterial: Material;
    private blitGlobalLight: Blit;

    private topColor: ColorV = new ColorV(1.00, 0.92, 0.81, 0.30);
    private midColor: ColorV = new ColorV(1.00, 0.91, 0.82, 0.19);
    private bottomColor: ColorV = new ColorV(1.00, 0.91, 0.82, 0.1);
    private mainLight: MainLight;
    private mainLightColor: ColorV = new ColorV(1.00, 0.92, 0.81, 1);
    private mainLightStrength: number = 1;
    private lightParents: Array<Object3D>;

    constructor(renderer: Renderer) {

        super(renderer, "LightRenderPass");

        this.target = new RenderTexture(renderer, "LightPass", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];


        this.depthStencilAttachment = new DepthStencilAttachment(this.renderer.texturesByLabel["GDepth"] as RenderTexture, {
            depthLoadOp: LoadOp.Load,
            depthStoreOp: StoreOp.Store,
            depthReadOnly: true
        });


    }

    init(data: any, mainLight: MainLight, lightParents: Array<Object3D>) {
        this.lightParents = lightParents;
        this.mainLight = mainLight;
        this.modelRenderer = new ModelRenderer(this.renderer, "lightModels")
        if (data) {

            this.mainLightColor.set(data.mainLightColor[0], data.mainLightColor[1], data.mainLightColor[2], data.mainLightColor[3]);
            this.mainLightStrength = data.mainLightStrength;
            this.topColor.set(data.topColor[0], data.topColor[1], data.topColor[2], data.topColor[3]);
            this.midColor.set(data.midColor[0], data.midColor[1], data.midColor[2], data.midColor[3]);
            this.bottomColor.set(data.bottomColor[0], data.bottomColor[1], data.bottomColor[2], data.bottomColor[3]);
            for (let plData of data.pointLights) {
                let p = new PointLight(this.renderer, "light1", this.modelRenderer, plData, this.lightParents)
                this.lights.push(p)

            }
        }


        this.globalLightMaterial = new Material(this.renderer, "blitGlobalLight", new GlobalLightInsideShader(this.renderer, "globalLight"))

        this.globalLightMaterial.uniforms.setUniform("topColor", this.topColor);
        this.globalLightMaterial.uniforms.setUniform("midColor", this.midColor);
        this.globalLightMaterial.uniforms.setUniform("bottomColor", this.bottomColor);

        this.globalLightMaterial.uniforms.setUniform("lightColor", this.mainLight.color);
        this.globalLightMaterial.uniforms.setUniform("lightPos", this.mainLight.getWorldPos());

        this.globalLightMaterial.uniforms.setTexture("shadowCubeDebug", this.renderer.texturesByLabel["ShadowCubeColor"]);
       // this.globalLightMaterial.uniforms.setTexture("shadowCube", this.renderer.texturesByLabel["ShadowCube"]);
        this.globalLightMaterial.uniforms.setTexture("aoTexture", this.renderer.texturesByLabel["OABlurPass"]);
        this.globalLightMaterial.uniforms.setTexture("gNormal", this.renderer.texturesByLabel["GNormal"]);
        this.globalLightMaterial.uniforms.setTexture("gMRA", this.renderer.texturesByLabel["GMRA"]);
        this.globalLightMaterial.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"]);
        this.globalLightMaterial.uniforms.setTexture("gColor", this.renderer.texturesByLabel["GColor"]);

        this.globalLightMaterial.blendModes = [
            {
                color: {
                    srcFactor: "one",
                    dstFactor: "one",
                    operation: "add",
                },
                alpha: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                },
            }

        ]


        this.blitGlobalLight = new Blit(this.renderer, 'blitPost', this.globalLightMaterial)


    }


    onUI() {
        UI.pushGroup("Light Inside")
        for (let p of this.lights) {
            p.update()
        }
        if (UI.LButton("Save Light")) {


            let lightsData = []
            for (let p of this.lights) {
                lightsData.push(p.getData())
            }
            let lightData = {
                mainLightColor: this.mainLightColor,
                mainLightStrength: this.mainLightStrength,
                topColor: this.topColor,
                midColor: this.midColor,
                bottomColor: this.bottomColor,
                pointLights: lightsData,
            }
            saveToJsonFile(lightData, "lightRoom")
        }
        UI.separator("Main Light")
        UI.LColor("color", this.mainLightColor)
        this.mainLightStrength = UI.LFloatSlider("strength", this.mainLightStrength, 0, 20);
        this.mainLight.color.set(this.mainLightColor.x, this.mainLightColor.y, this.mainLightColor.z, this.mainLightStrength)


        UI.separator("Global Light")
        UI.LColor("topLight", this.topColor)
        UI.LColor("midLight", this.midColor)
        UI.LColor("bottomLight", this.bottomColor)

        this.globalLightMaterial.uniforms.setUniform("lightColor", this.mainLight.color)
        this.globalLightMaterial.uniforms.setUniform("lightPos", this.mainLight.getWorldPos())
        this.globalLightMaterial.uniforms.setUniform("topColor", this.topColor)
        this.globalLightMaterial.uniforms.setUniform("midColor", this.midColor)
        this.globalLightMaterial.uniforms.setUniform("bottomColor", this.bottomColor)


        UI.separator("Lights")
        UI.pushLList("Point Lights", 60);
        let count = 0;
        for (let light of this.lights) {
            if (UI.LListItem(count + ":" + light.label, light == this.currentLight)) {
                this.currentLight = light;
            }
            count++;
        }
        UI.popList();

        if (UI.LButton("+ add Light")) {
            let p = new PointLight(this.renderer, "light2", this.modelRenderer, null, this.lightParents)
            this.lights.push(p)
            this.currentLight = p;

        }
        if (this.currentLight) {

            if (UI.LButton("x delete Light")) {
                const index = this.lights.indexOf(this.currentLight, 0);
                if (index > -1) {
                    this.lights.splice(index, 1);
                }
                this.currentLight.destroy()
                this.currentLight = null;
            } else {
                this.currentLight.onDataUI()
            }

        }
UI.popGroup()

    }

    draw() {
        this.blitGlobalLight.draw(this);
        this.modelRenderer.draw(this);


    }

    setLightPos(lightPos: Vector3) {
        this.globalLightMaterial.uniforms.setUniform("lightPos", lightPos)
    }
}

import RenderPass from "../lib/core/RenderPass";
import ModelRenderer from "../lib/model/ModelRenderer";
import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import {LoadOp, StoreOp} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";

import Material from "../lib/core/Material";

import UI from "../lib/UI/UI";
import PointLight from "./PointLight";

import Blit from "../lib/Blit";
import GlobalLightInsideShader from "../shaders/GlobalLightInsideShader";
import ColorV from "../lib/ColorV";
import {saveToJsonFile} from "../lib/SaveUtils";
import MainLight from "../MainLight";
import Object3D from "../lib/core/Object3D";
import GameModel from "../../public/GameModel";
import RenderSettings from "../RenderSettings";
import MathArray from "@math.gl/core/src/classes/base/math-array";

export default class LightRoomRenderPass extends RenderPass {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;
    private modelRenderer: ModelRenderer;
    private mainLights: Array<MainLight>;
    private lights: Array<PointLight> = []
    private currentLight!: PointLight
    private globalLightMaterial: Material;
    private blitGlobalLight: Blit;

    private topColor: ColorV = new ColorV(1.00, 0.92, 0.81, 0.30);
    private midColor: ColorV = new ColorV(1.00, 0.91, 0.82, 0.19);
    private bottomColor: ColorV = new ColorV(1.00, 0.91, 0.82, 0.1);

    // private topColorNight: ColorV = new ColorV(1.00, 0.92, 0.81, 0.10);
    //private midColorNight: ColorV = new ColorV(1.00, 0.91, 0.82, 0.09);
    //private bottomColorNight: ColorV = new ColorV(1.00, 0.91, 0.82, 0.1);

    private topColorRight: ColorV = new ColorV(1.00, 0.92, 0.81, 0.0);
    private midColorRight: ColorV = new ColorV(1.00, 0.91, 0.82, 0.0);
    private bottomColorRight: ColorV = new ColorV(1.00, 0.91, 0.82, 0);


    private lightParents: Array<Object3D>;

    constructor(renderer: Renderer, target: RenderTexture) {

        super(renderer, "LightRenderPass");
        RenderSettings.registerPass(this);
        this.target = target;
        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];


        this.depthStencilAttachment = new DepthStencilAttachment(this.renderer.texturesByLabel["GDepth"] as RenderTexture, {
            depthLoadOp: LoadOp.Load,
            depthStoreOp: StoreOp.Store,
            depthReadOnly: true
        });


    }

    init(data: any, mainLights: Array<MainLight>, lightParents: Array<Object3D>) {
        this.lightParents = lightParents;
        this.mainLights = mainLights;
        this.modelRenderer = new ModelRenderer(this.renderer, "lightModels")
        if (data) {
            mainLights[0].color.from(data.mainLightColor1);
            mainLights[0].initColor();
            mainLights[1].color.from(data.mainLightColor2);
            mainLights[1].initColor();
            mainLights[2].color.from(data.mainLightColor3);
            mainLights[2].initColor();

            mainLights[3].color.from(data.mainLightColor4);
            mainLights[3].initColor();
            if (data.mainLightColor5)
                mainLights[4].color.from(data.mainLightColor5);
            mainLights[4].initColor();
            if (data.mainLightColor6)
                mainLights[5].color.from(data.mainLightColor6);
            mainLights[5].initColor();

            this.topColor.set(data.topColor[0], data.topColor[1], data.topColor[2], data.topColor[3]);
            this.midColor.set(data.midColor[0], data.midColor[1], data.midColor[2], data.midColor[3]);
            this.bottomColor.set(data.bottomColor[0], data.bottomColor[1], data.bottomColor[2], data.bottomColor[3]);

            // this.topColorNight.set(data.topColorNight[0], data.topColorNight[1], data.topColorNight[2], data.topColorNight[3]);
            //this.midColorNight.set(data.midColorNight[0], data.midColorNight[1], data.midColorNight[2], data.midColorNight[3]);
            //this.bottomColorNight.set(data.bottomColorNight[0], data.bottomColorNight[1], data.bottomColorNight[2], data.bottomColorNight[3]);


            this.topColorRight.set(data.topColorRight[0], data.topColorRight[1], data.topColorRight[2], data.topColorRight[3]);
            this.midColorRight.set(data.midColorRight[0], data.midColorRight[1], data.midColorRight[2], data.midColorRight[3]);
            this.bottomColorRight.set(data.bottomColorRight[0], data.bottomColorRight[1], data.bottomColorRight[2], data.bottomColorRight[3]);


            if (lightParents.length) {
                for (let plData of data.pointLights) {

                    let p = new PointLight(this.renderer, "light1", this.modelRenderer, plData, this.lightParents)
                    p.setStrength(0);
                    this.lights.push(p)
                    GameModel.pointLightsByLabel[p.label] = p;

                }
            }
            GameModel.pointLightsByLabel["glowPantsLight"].setStrength(0.5);
        }


        this.globalLightMaterial = new Material(this.renderer, "blitGlobalLight", new GlobalLightInsideShader(this.renderer, "globalLight"))

        this.setUniforms()


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

    public setUniforms() {
        for (let light of this.lights) {
            light.update()
        }
        this.globalLightMaterial.uniforms.setUniform("lightColor1", this.mainLights[0].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos1", this.mainLights[0].getWorldPos());

        this.globalLightMaterial.uniforms.setUniform("lightColor2", this.mainLights[1].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos2", this.mainLights[1].getWorldPos());

        this.globalLightMaterial.uniforms.setUniform("lightColor3", this.mainLights[2].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos3", this.mainLights[2].getWorldPos());

        this.globalLightMaterial.uniforms.setUniform("lightColor4", this.mainLights[3].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos4", this.mainLights[3].getWorldPos());

        this.globalLightMaterial.uniforms.setUniform("lightColor5", this.mainLights[4].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos5", this.mainLights[4].getWorldPos());

        this.globalLightMaterial.uniforms.setUniform("lightColor6", this.mainLights[5].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos6", this.mainLights[5].getWorldPos());


        this.globalLightMaterial.uniforms.setUniform("topColor", this.topColor)
        this.globalLightMaterial.uniforms.setUniform("midColor", this.midColor)
        this.globalLightMaterial.uniforms.setUniform("bottomColor", this.bottomColor)

        this.globalLightMaterial.uniforms.setUniform("topColorRight", this.topColorRight)
        this.globalLightMaterial.uniforms.setUniform("midColorRight", this.midColorRight)
        this.globalLightMaterial.uniforms.setUniform("bottomColorRight", this.bottomColorRight)
        if (GameModel.roomCamOffset > 0.9) {
            this.globalLightMaterial.uniforms.setUniform("shadowSamples", [1, 8, 2, 0] as MathArray)
        } else if (GameModel.roomCamOffset < -0.9) {


            this.globalLightMaterial.uniforms.setUniform("shadowSamples", [8, 1, 8, 0] as MathArray)
        } else {
            this.globalLightMaterial.uniforms.setUniform("shadowSamples", [1, 1, 1, 0] as MathArray)
        }


        this.globalLightMaterial.uniforms.setTexture("shadowCube1", this.renderer.texturesByLabel["ShadowCubeColor1"]);
        this.globalLightMaterial.uniforms.setTexture("shadowCube2", this.renderer.texturesByLabel["ShadowCubeColor2"]);
        this.globalLightMaterial.uniforms.setTexture("shadowCube3", this.renderer.texturesByLabel["ShadowCubeColor3"]);
        this.globalLightMaterial.uniforms.setTexture("shadowCube4", this.renderer.texturesByLabel["ShadowCubeColor4"]);
        this.globalLightMaterial.uniforms.setTexture("shadowCube5", this.renderer.texturesByLabel["ShadowCubeColor5"]);
        this.globalLightMaterial.uniforms.setTexture("shadowCube6", this.renderer.texturesByLabel["ShadowCubeColor6"]);

        this.globalLightMaterial.uniforms.setTexture("aoTexture", this.renderer.texturesByLabel["GTAOdenoise"]);
        this.globalLightMaterial.uniforms.setTexture("gNormal", this.renderer.texturesByLabel["GNormal"]);
        this.globalLightMaterial.uniforms.setTexture("gMRA", this.renderer.texturesByLabel["GMRA"]);
        this.globalLightMaterial.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"]);
        this.globalLightMaterial.uniforms.setTexture("gColor", this.renderer.texturesByLabel["GColor"]);

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
                mainLightColor1: this.mainLights[0].color,
                mainLightColor2: this.mainLights[1].color,
                mainLightColor3: this.mainLights[2].color,
                mainLightColor4: this.mainLights[3].color,
                mainLightColor5: this.mainLights[4].color,
                mainLightColor6: this.mainLights[5].color,
                topColor: this.topColor,
                midColor: this.midColor,
                bottomColor: this.bottomColor,
                // topColorNight: this.topColorNight,
                // midColorNight: this.midColorNight,
                // bottomColorNight: this.bottomColorNight,
                topColorRight: this.topColorRight,
                midColorRight: this.midColorRight,
                bottomColorRight: this.bottomColorRight,
                pointLights: lightsData,
            }
            saveToJsonFile(lightData, "lightRoom")
        }
        UI.separator("Main Light")

        this.mainLights[0].onDataUI();
        this.mainLights[1].onDataUI();
        this.mainLights[2].onDataUI();
        this.mainLights[3].onDataUI();
        this.mainLights[4].onDataUI();
        this.mainLights[5].onDataUI();
        UI.separator("Global Light")
        UI.LColor("topLightDay", this.topColor)
        UI.LColor("midLightDay", this.midColor)
        UI.LColor("bottomLightDay", this.bottomColor)

        //   UI.LColor("topLightNight", this.topColorNight)
        //  UI.LColor("midLightNight", this.midColorNight)
        // UI.LColor("bottomLightNight", this.bottomColorNight)

        UI.LColor("topLightRight", this.topColorRight)
        UI.LColor("midLightRight", this.midColorRight)
        UI.LColor("bottomLightRight", this.bottomColorRight)


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

    onSettingsChange() {
        super.onSettingsChange();
        if (this.globalLightMaterial)
            this.globalLightMaterial.uniforms.setUniform("dof", RenderSettings.dof_Settings)
    }

    draw() {
        //console.log(this.target,this.target.getView() )
        this.blitGlobalLight.draw(this);
        this.modelRenderer.draw(this);


    }


}

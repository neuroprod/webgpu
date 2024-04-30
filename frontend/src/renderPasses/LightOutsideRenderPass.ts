import RenderPass from "../lib/core/RenderPass";

import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import {LoadOp, StoreOp} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";

import Material from "../lib/core/Material";

import {Matrix4, Vector3, Vector4} from "math.gl";


import UI from "../lib/UI/UI";


import Blit from "../lib/Blit";

import ColorV from "../lib/ColorV";

import GlobalLightOutsideShader from "../shaders/GlobalLightOutsideShader";
import RenderSettings from "../RenderSettings";
import GameModel from "../../public/GameModel";
import Object3D from "../lib/core/Object3D";
import ModelRenderer from "../lib/model/ModelRenderer";
import PointLight from "./PointLight";

export default class LightOutsideRenderPass extends RenderPass {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;

    private globalLightMaterial: Material;
    private blitGlobalLight: Blit;
    private fogColorDay: ColorV = new ColorV(0.71, 0.91, 1.00, 1.00);
    public fogDataDay = new Vector4(0.67, 1.40, 0.00, 0.00);

    private fogColorNight: ColorV = new ColorV(0.00, 0.02, 0.04, 1.00);
    public fogDataNight = new Vector4(0.27, 0.88, 0.00, 0.00);
    private sunLightColor: ColorV = new ColorV(1.00, 0.83, 0.63, 1.00);
    private sunLightStrength: number = 4.5;

    private topColorDay: ColorV = new ColorV(0.73, 0.99, 0.95, 0.40);
    private midColorDay: ColorV = new ColorV(1.00, 0.91, 0.82, 0.19);
    private bottomColorDay: ColorV = new ColorV(1.00, 0.91, 0.82, 0.1);


    private moonLightColor: ColorV = new ColorV(0.2, 0.40, 1.00, 1.00);
    private moonLightStrength: number = 0.86;

    private topColorNight: ColorV = new ColorV(0.01, 0.40, 1.00, 0.02);
    private midColorNight: ColorV = new ColorV(0.01, 0.96, 1.00, 0.01);
    private bottomColorNight: ColorV = new ColorV(0.01, 0.40, 1.00, 0.0);


    public lightColor: ColorV = new ColorV(0.99, 0.55, 0.00, 1.00);
    private lightStrength: number = 30;


    public sunDir = new Vector3(-0.172996, -0.694981, -0.697907);
    public lightGrave: Object3D;
    public lightPos: Vector3 = new Vector3();
    private modelRenderer: ModelRenderer;
    private pointLight: PointLight;

    constructor(renderer: Renderer, target: RenderTexture) {

        super(renderer, "LightOutsideRenderPass");
        RenderSettings.registerPass(this);
        this.target = target;
        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];


        this.depthStencilAttachment = new DepthStencilAttachment(this.renderer.texturesByLabel["GDepth"] as RenderTexture, {
            depthLoadOp: LoadOp.Load,
            depthStoreOp: StoreOp.Store,
            depthReadOnly: true
        });

        this.modelRenderer = new ModelRenderer(this.renderer, "lightModels")
    }

    init() {


        this.globalLightMaterial = new Material(this.renderer, "blitGlobalLight", new GlobalLightOutsideShader(this.renderer, "globalLightOutside"))

        let data = {
            "label": "millLight",
            "position": [
                0,
                0,
                0
            ],
            "size": 3.0,
            "color": [
                0.13043975830078125,
                1.0,
                0.114453125,
                1
            ],
            "strength": 1,
            "castShadow": false,
            "numShadowSamples": 1,
            "shadowScale": 1,
            "sizeMesh": 0.05,
            "showLightMesh": false,
            "parentIndex": -1
        }

        this.pointLight = new PointLight(this.renderer, "p", this.modelRenderer, data, [])


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

    setUniforms2(matrix2: Matrix4) {
        if (GameModel.currentPants == 4 && GameModel.dayNight == 1) {
            let pos = GameModel.characterPos.clone()
            pos.y -= 0.5;
            pos.z += 0.3;
            this.pointLight.setPositionV(pos)
            this.pointLight.update()
        }
        this.globalLightMaterial.uniforms.setUniform("shadowMatrix2", matrix2);
    }

    setUniforms(matrix: Matrix4) {

        this.globalLightMaterial.uniforms.setUniform("topColor", this.topColorDay.clone().lerp(this.topColorNight, GameModel.dayNight))
        this.globalLightMaterial.uniforms.setUniform("midColor", this.midColorDay.clone().lerp(this.midColorNight, GameModel.dayNight))
        this.globalLightMaterial.uniforms.setUniform("bottomColor", this.bottomColorDay.clone().lerp(this.bottomColorNight, GameModel.dayNight))

        this.globalLightMaterial.uniforms.setUniform("shadowMatrix1", matrix);


        this.sunLightColor.w = this.sunLightStrength;
        this.moonLightColor.w = this.moonLightStrength;
        this.globalLightMaterial.uniforms.setUniform("lightColor", this.sunLightColor.clone().lerp(this.moonLightColor, GameModel.dayNight));
        this.globalLightMaterial.uniforms.setUniform("lightDir", new Vector4(this.sunDir.x, this.sunDir.y, this.sunDir.z, 1));

        this.globalLightMaterial.uniforms.setUniform("fogColor", this.fogColorDay.clone().lerp(this.fogColorNight, GameModel.dayNight));
        this.globalLightMaterial.uniforms.setUniform("fogData", this.fogDataDay.clone().lerp(this.fogDataNight, GameModel.dayNight));

        this.globalLightMaterial.uniforms.setUniform("dayNight", GameModel.dayNight);
        this.lightColor.w = this.lightStrength * GameModel.dayNight;
        this.lightPos = this.lightGrave.getWorldPos();
        this.globalLightMaterial.uniforms.setUniform("pointlightColor", this.lightColor);
        this.globalLightMaterial.uniforms.setUniform("pointlightPos", this.lightPos);
        this.globalLightMaterial.uniforms.setTexture("shadow1", this.renderer.texturesByLabel["Shadow1"]);
        this.globalLightMaterial.uniforms.setTexture("shadow2", this.renderer.texturesByLabel["Shadow2"]);
        this.globalLightMaterial.uniforms.setTexture("aoTexture", this.renderer.texturesByLabel["GTAOdenoise"]);
        this.globalLightMaterial.uniforms.setTexture("gNormal", this.renderer.texturesByLabel["GNormal"]);
        this.globalLightMaterial.uniforms.setTexture("gMRA", this.renderer.texturesByLabel["GMRA"]);
        this.globalLightMaterial.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"]);
        this.globalLightMaterial.uniforms.setTexture("gColor", this.renderer.texturesByLabel["GColor"]);
        this.globalLightMaterial.uniforms.setTexture("shadowCubeDebug", this.renderer.texturesByLabel["ShadowCubeColor1"]);
    }

    onUI() {
        UI.pushGroup("Light Outside")
        UI.LColor("fogColorDay", this.fogColorDay)
        UI.LVector("fogDataDay", this.fogDataDay)

        UI.LColor("fogColorNight", this.fogColorNight)
        UI.LVector("fogDataNight", this.fogDataNight)
        UI.separator("Sun Light")
        UI.LVector("dir", this.sunDir, true);

        // GameModel.dayNight =UI.LFloatSlider("dayNight", GameModel.dayNight,0,1);
        UI.separator("Day")
        this.sunLightColor.w = 1;
        UI.LColor("sunColor", this.sunLightColor)
        this.sunLightColor.w = this.sunLightStrength = UI.LFloatSlider("strength", this.sunLightStrength, 0, 20);

        UI.separator("Global Light Day")
        UI.LColor("topLightDay", this.topColorDay)
        UI.LColor("midLightDay", this.midColorDay)
        UI.LColor("bottomLightDay", this.bottomColorDay)

        UI.separator("Night")
        this.moonLightColor.w = 1;
        UI.LColor("moonColor", this.moonLightColor)
        this.moonLightColor.w = this.moonLightStrength = UI.LFloatSlider("strength Moon", this.moonLightStrength, 0, 20);

        UI.separator("Global Light Night")
        UI.LColor("topLightNight", this.topColorNight)
        UI.LColor("midLightNight", this.midColorNight)
        UI.LColor("bottomLightNight", this.bottomColorNight)


        UI.separator("Light")
        this.lightColor.w = 1;
        UI.LColor("lightColor", this.lightColor)
        this.lightColor.w = this.lightStrength = UI.LFloatSlider("strength Light", this.lightStrength, 0, 20);


        UI.popGroup()
    }

    onSettingsChange() {
        super.onSettingsChange();
        if (this.globalLightMaterial)
            this.globalLightMaterial.uniforms.setUniform("dof", RenderSettings.dof_Settings)
    }

    draw() {

        this.blitGlobalLight.draw(this);
        if (GameModel.currentPants == 4 && GameModel.dayNight == 1) {
            this.modelRenderer.draw(this);
        }
    }


}

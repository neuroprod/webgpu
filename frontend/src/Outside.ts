import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import ModelRenderer from "./lib/model/ModelRenderer";
import Object3D from "./lib/core/Object3D";

import Scene from "./Scene";
import Timer from "./lib/Timer";
import MailBox from "./extras/MailBox";
import Material from "./lib/core/Material";
import WaterTopShader from "./shaders/WaterTopShader";
import Model from "./lib/model/Model";
import WaterFrontShader from "./shaders/WaterFrontShader";

import Fish from "./extras/Fish";
import FogPlanes from "./extras/FogPlanes";
import Leaves from "./extras/Leaves";
import TextureLoader from "./lib/textures/TextureLoader";
import GameModel, {StateFasion, StateGirl, StateGold, StateHunter} from "../public/GameModel";
import {NumericArray, Vector3} from "math.gl";

import GlassGlowShader from "./shaders/GlassGlowShader";

import SkyShader from "./shaders/SkyShader";
import RenderSettings from "./RenderSettings";
import MathArray from "@math.gl/core/src/classes/base/math-array";
import SparkShader from "./extras/SparkShader";
import Plane from "./lib/meshes/Plane";
import gsap from "gsap";
import {BlendFactor, BlendOperation} from "./lib/WebGPUConstants";
import GlassGlowGlassShader from "./shaders/GlassGlowGlassShader";
import ParticlesGold from "./extras/ParticlesGold";


export default class Outside extends Scene {
    modelRenderer: ModelRenderer;
    modelRendererTrans: ModelRenderer;
    root: Object3D


    public lightGrave: Object3D;
    public mailBox: MailBox;
    private waterTop: Model;
    private waterFront: Model;
    private fish: Fish;
    private fogPlanes: FogPlanes;
    private leaves: Leaves;
    private lightGraveHolder: Object3D;
    private lightGraveHolderPos: Vector3;

    private glassGrave: Model;
    private materialGlass: Material;
    private materialGlow: Material;
    private sky: Model;
    private spark: Model;
    public nextSparkTime = 3;
    private sparkScale: number = 0;

    testPos = new Vector3()
    particlesGold: ParticlesGold;

    constructor(renderer: Renderer, preloader: PreLoader) {

        super(renderer, preloader, "outside")
        new TextureLoader(this.renderer, preloader, "leaveAlpha.png", {});
        new TextureLoader(this.renderer, preloader, "leaveColor.png", {});
        new TextureLoader(this.renderer, preloader, "fog.png", {});
    }

    init() {

        this.particlesGold = new ParticlesGold(this.renderer);

        GameModel.animationMixer.addAnimations(this.glFTLoader.animations)
        this.modelRenderer = new ModelRenderer(this.renderer, "outside");
        this.modelRendererTrans = new ModelRenderer(this.renderer, "outsideTrans");

        this.root = this.glFTLoader.root
        this.root.setPosition(0, -1.5, 0)
        this.lightGraveHolder = this.glFTLoader.objectsByName["lightGrave"];
        this.lightGraveHolderPos = this.lightGraveHolder.getPosition().clone();
        this.lightGrave = new Object3D(this.renderer)
        this.lightGrave.setPosition(0, -0.2, 0.0)
        this.lightGraveHolder.addChild(this.lightGrave)
        let l: GPUBlendState = {

            color: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            },
            alpha: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            }
        }

        //this.glFTLoader.modelsByName["sky"].material.depthWrite =false;
        this.fish = new Fish(this.renderer, this.glFTLoader.modelsByName["fish1"], this.glFTLoader.modelsByName["fish2"]);
        this.glassGrave = this.glFTLoader.modelsByName["lightGrave_G"]

        // this.glassGrave.material.uniforms.setTexture("normalTexture",this.renderer.texturesByLabel["WaterNormal.jpg"]);
        this.materialGlass = new Material(this.renderer, "glassGlowGlass", new GlassGlowGlassShader(this.renderer, 'glassGlowGlass'));
        this.materialGlass.depthWrite = false;
        this.materialGlass.blendModes = [l];

        this.glassGrave.material = this.materialGlass
        this.materialGlow = new Material(this.renderer, "glassGlow", new GlassGlowShader(this.renderer, 'glassGlow'));
        this.materialGlow.depthWrite = false;
        for (let m of this.glFTLoader.models) {
            this.modelRenderer.addModel(m)

        }
        this.leaves = new Leaves(this.renderer)
        this.modelRenderer.addModel(this.leaves.model)
        this.mailBox = new MailBox(this.glFTLoader);

        //"colorTexture"
        //"mraTexture"
        //"normalTexture

        let gpMat = this.renderer.modelByLabel["grandpaPants"].material;
        gpMat.uniforms.setTexture("colorTexture", this.renderer.texturesByLabel["textures/pantsGrandpa_Color.webp"])
        gpMat.uniforms.setTexture("mraTexture", this.renderer.texturesByLabel["textures/pantsGrandpa_MRA.webp"])
        gpMat.uniforms.setTexture("normalTexture", this.renderer.texturesByLabel["textures/pantsGrandpa_Normal.webp"])

        let gMat = this.renderer.modelByLabel["girlPants"].material;
        gMat.uniforms.setTexture("colorTexture", this.renderer.texturesByLabel["textures/pantsGirl_Color.webp"])
        gMat.uniforms.setTexture("mraTexture", this.renderer.texturesByLabel["textures/pantsGirl_MRA.webp"])
        gMat.uniforms.setTexture("normalTexture", this.renderer.texturesByLabel["textures/pantsGirl_Normal.webp"])


        this.spark = new Model(this.renderer, "spark")
        this.spark.material = new Material(this.renderer, "sparkMaterial", new SparkShader(this.renderer, "spark"))
        this.spark.material.depthWrite = false;

        this.spark.material.blendModes = [l];
        this.spark.mesh = new Plane(this.renderer)
    }

    public update() {
        //UI.pushWindow("test")
        //UI.LVector("pos",this.testPos)
        //UI.popWindow()
        this.particlesGold.update();
        this.fogPlanes.update()
        this.fish.update();
        this.leaves.update()
        //GameModel.dayNight
        this.waterTop.material.uniforms.setUniform("time", Timer.time * 0.05)
        this.waterFront.material.uniforms.setUniform("time", Timer.time);
        this.waterFront.material.uniforms.setUniform("dayNight", GameModel.dayNight)
        this.waterTop.material.uniforms.setUniform("dayNight", GameModel.dayNight)

        this.sky.material.uniforms.setUniform("colorTop", RenderSettings.skyTop as MathArray)
        this.sky.material.uniforms.setUniform("colorBottom", RenderSettings.skyBottom as MathArray)
        this.sky.material.uniforms.setUniform("dayNight", 1 - (GameModel.dayNight * 0.9));
        if (GameModel.dayNight == 0) {
            this.glassGrave.material = this.materialGlass

        } else {
            this.glassGrave.material = this.materialGlow
        }


        for (let m of this.glFTLoader.models) {
            if (m.needsWind) {
                m.material.uniforms.setUniform("time", Timer.time)
                if (m.castShadow) {
                    if (m.shadowMaterial.uniforms)
                        m.shadowMaterial.uniforms.setUniform("time", Timer.time)
                }
            }
        }
        this.updateSparks();
        // this.lightGraveHolderPosMove.from(this.lightGraveHolderPos)
        // this.lightGraveHolderPosMove.y +=Math.sin(Timer.time*2)

        //this.lightGraveHolder.setPositionV( this.lightGraveHolderPosMove);
        //GameModel.dayNight
        // UI.LFloat('offset',0)
        //  this.glFTLoader.root.setPosition(this.renderer.ratio * 4 / 2 +UI.LFloat('offset',0), -1.5, 0)
    }

    setSpark() {

        if (GameModel.stateGirl == StateGirl.FIND_STICK) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["birdHouse"].getWorldPos().add(new Vector3(-0.20, -0.01, 0.13) as NumericArray));
            return true;
        }
        if (GameModel.stateGirl == StateGirl.BIRD_HOUSE_FELL) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["stick"].getWorldPos().add(new Vector3(0.00, 0.03, 0.07) as NumericArray));
            return true;
        }
        if (GameModel.stateFashion == StateFasion.GET_FASION_PANTS) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["package"].getWorldPos().add(new Vector3(-0.14, 0.00, 0.14) as NumericArray));
            return true;
        }
        if (GameModel.stateGold == StateGold.GET_SHOVEL) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["grave"].getWorldPos().add(new Vector3(-0.01, 0.15, 0.81) as NumericArray));
            return true;
        }
        if (GameModel.stateGold == StateGold.FIND_NOTE) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["shovel"].getWorldPos().add(new Vector3(-0.03, -0.86, 0.35) as NumericArray));
            return true;
        }

        if (GameModel.stateHunter == StateHunter.START) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["hunterPants"].getWorldPos().add(new Vector3(-0.1, 0.0, 0.1) as NumericArray));
            return true;
        }
        if (GameModel.renderer.modelByLabel["grandpaPants"].visible) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["grandpaPants"].getWorldPos().add(new Vector3(-0.1, 0.0, 0.1) as NumericArray));
            return true;
        }

        return false;
    }

    updateSparks() {
        if (!GameModel.currentTransition) this.nextSparkTime -= Timer.delta;
        if (this.nextSparkTime < 0) {


            this.nextSparkTime = 3 + Math.random() * 3;
            if (!this.setSpark()) return;
            let tl = gsap.timeline()
            tl.set(this, {sparkScale: 0.0}, 0);
            tl.to(this, {sparkScale: 0.25, duration: 0.2}, 0);
            tl.to(this, {sparkScale: 0.0, duration: 0.3}, 0.4);
        }


        if (this.sparkScale <= 0.001) {
            this.spark.visible = false;
        } else {
            this.spark.visible = true;
        }
        if (this.spark.visible) {

            this.spark.setEuler(Math.PI / 2, 0, -Timer.time * 5);
            this.spark.setScale(this.sparkScale, this.sparkScale, this.sparkScale);
        }
    }

    makeTransParent() {
        this.modelRendererTrans.addModel(this.spark)
        this.modelRenderer.addModel(this.particlesGold.model)
        this.fogPlanes = new FogPlanes(this.renderer, this.glFTLoader.root)
        for (let m of this.fogPlanes.models) {
            this.modelRendererTrans.addModel(m)

        }

        for (let m of this.glFTLoader.modelsGlass) {
            let needsDepth = true
            if (m.label == "waterTop_G") {
                m.material = new Material(this.renderer, m.label, new WaterTopShader(this.renderer, "waterTop"));
                m.material.depthWrite = false;
                this.waterTop = m;
            }
            if (m.label == "waterFront_G") {
                m.material = new Material(this.renderer, m.label, new WaterFrontShader(this.renderer, "waterFront"));
                m.material.depthWrite = false;
                this.waterFront = m;
            }
            if (m.label == "sky_G") {
                m.material = new Material(this.renderer, 'sky', new SkyShader(this.renderer, "sky"));
                m.material.depthWrite = false;
                this.sky = m;
                needsDepth = false;
            }
            if (m.material.label == "glassGlowGlass") needsDepth = false;
            if (needsDepth) {

                m.material.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
                m.material.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["BlurLightPass"])
            }
            this.modelRendererTrans.addModel(m)

        }
    }

    onUIGame() {
        this.mailBox.onUI()
    }

}

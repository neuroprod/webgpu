import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import TextureLoader from "./lib/textures/TextureLoader";

import MainLight from "./MainLight";
import Object3D from "./lib/core/Object3D";
import {LaptopScreen} from "./extras/LaptopScreen";
import {FpsScreen} from "./extras/FpsScreen";
import ModelRenderer from "./lib/model/ModelRenderer";
import Mill from "./extras/Mill";


import Scene from "./Scene";
import Clock from "./extras/Clock";
import {Osc2Screen} from "./extras/Osc2Screen";
import {Osc1Screen} from "./extras/Osc1Screen";
import Machine from "./extras/Machine";
import GameModel, {StateFasion, StateGold, StateGrandpa, StateHighTech} from "../public/GameModel";


import Model from "./lib/model/Model";
import Material from "./lib/core/Material";
import Plane from "./lib/meshes/Plane";
import SparkShader from "./extras/SparkShader";
import Timer from "./lib/Timer";
import gsap from "gsap";
import {NumericArray, Vector3} from "math.gl";

export default class Room extends Scene {
    leftHolder: Object3D;
    rightHolder: Object3D;
    centerHolder: Object3D;

    modelRenderer: ModelRenderer;
    modelRendererTrans: ModelRenderer;
    root: Object3D;

    laptopScreen: LaptopScreen;
    mill: Mill;
    clock: Clock;

    public lightKitchen: MainLight;
    public lightLab: MainLight;
    public lightDoor: MainLight;
    public lightWall: MainLight;
    lightWallLiving: MainLight;
    lightTable: MainLight;
    machine: Machine;
    private fpsScreen: FpsScreen;
    private bookCase: Object3D;
    private hitLeftRoomCenter: Object3D;
    private hitRightRoom: Object3D;
    private osc2Screen: Osc2Screen;
    private osc1Screen: Osc1Screen;
    private paintingHolder: Object3D;
    private plant: Model;
    private pot: Model;
    private posterLab: Model;
    private spark: Model;
    public nextSparkTime = 3;
    private sparkScale: number = 0;
    testPos = new Vector3()

    constructor(renderer: Renderer, preloader: PreLoader) {

        super(renderer, preloader, "room")
        new TextureLoader(this.renderer, preloader, "GCode.png", {});
        new TextureLoader(this.renderer, preloader, "LT_email.png", {});

        new TextureLoader(this.renderer, preloader, "LT_readMail1.png", {});
        new TextureLoader(this.renderer, preloader, "LT_wait.png", {});
        new TextureLoader(this.renderer, preloader, "LT_programming.png", {});
        new TextureLoader(this.renderer, preloader, "LT_readMail2.png", {});
        new TextureLoader(this.renderer, preloader, "LT_pantsTemp.png", {});
        new TextureLoader(this.renderer, preloader, "LT_buy.png", {});
        new TextureLoader(this.renderer, preloader, "7dig.png", {});
        new TextureLoader(this.renderer, preloader, "glowPantsProgress.png", {});
        new TextureLoader(this.renderer, preloader, "spark.png", {});
    }

    init() {


        this.modelRenderer = new ModelRenderer(this.renderer, "room");
        this.modelRendererTrans = new ModelRenderer(this.renderer, "roomTrans");

        this.root = this.glFTLoader.root
        this.glFTLoader.root.setPosition(0, -1.5, 0)

        this.mill = new Mill(this.glFTLoader.modelsByName["mill"], this.renderer)
        for (let m of this.glFTLoader.models) {
            this.modelRenderer.addModel(m)

        }


        this.leftHolder = this.glFTLoader.objectsByName["left"]
        this.rightHolder = this.glFTLoader.objectsByName["right"]
        this.centerHolder = this.glFTLoader.objectsByName["center"]
        this.bookCase = this.glFTLoader.objectsByName["bookCase"];

        this.hitLeftRoomCenter = this.glFTLoader.objectsByName["_HitLeftRoomCenter"]
        this.hitRightRoom = this.glFTLoader.objectsByName["_HitRightRoom"];


        this.lightWallLiving = new MainLight(this.renderer, "lightWallLiving")
        this.glFTLoader.modelsByName["wallLampLamp"].addChild(this.lightWallLiving)
        this.glFTLoader.modelsByName["wallLampLamp"].castShadow = false;

        this.lightTable = new MainLight(this.renderer, "lightTable")
        this.glFTLoader.modelsByName["tableLampCap"].addChild(this.lightTable)
        this.glFTLoader.modelsByName["tableLampCap"].castShadow = false;

        this.lightKitchen = new MainLight(this.renderer, "mainLightKitchen")
        this.glFTLoader.modelsByName["mainLight"].addChild(this.lightKitchen)
        this.glFTLoader.modelsByName["mainLight"].castShadow = false;
        this.lightLab = new MainLight(this.renderer, "mainLightLab")
        this.glFTLoader.objectsByName["LightComp"].addChild(this.lightLab);
        this.glFTLoader.modelsByName["LightComp"].castShadow = false;


        this.lightDoor = new MainLight(this.renderer, "lightDoor")
        this.glFTLoader.objectsByName["lightDoor"].addChild(this.lightDoor);
        this.glFTLoader.modelsByName["lightDoor"].castShadow = false;


        this.lightWall = new MainLight(this.renderer, "lightWall")
        this.glFTLoader.objectsByName["lightWall"].addChild(this.lightWall);
        this.glFTLoader.modelsByName["lightWall"].castShadow = false;


        this.laptopScreen = new LaptopScreen(this.renderer, this.glFTLoader.modelsByName["labtop"]);
        this.laptopScreen.materialSolid = this.glFTLoader.materialSolid;
        this.modelRenderer.addModel(this.laptopScreen);

        this.fpsScreen = new FpsScreen(this.renderer, this.glFTLoader.objectsByName["powersup"]);
        this.modelRenderer.addModel(this.fpsScreen);

        this.osc2Screen = new Osc2Screen(this.renderer, this.glFTLoader.objectsByName["ossiloscope2"]);
        this.modelRenderer.addModel(this.osc2Screen);

        this.osc1Screen = new Osc1Screen(this.renderer, this.glFTLoader.objectsByName["oscilloscope"]);
        this.modelRenderer.addModel(this.osc1Screen);

        this.clock = new Clock(this.glFTLoader.modelsByName["hour"], this.glFTLoader.modelsByName["minutes"])
        GameModel.clock = this.clock
        this.machine = new Machine(this.renderer);


        this.paintingHolder = this.glFTLoader.objectsByName["paintingHolder"]

        this.plant = this.glFTLoader.modelsByName["plant_Monstera_Deliciosa"]
        this.pot = this.glFTLoader.modelsByName["pot2"]
        this.posterLab = this.glFTLoader.modelsByName["posterLab"];

        //   this.windowOutside = new WindowOutside(this.renderer, this.glFTLoader.objectsByName["windowIn"]);
        //  this.modelRenderer.addModel(this.windowOutside);

        this.spark = new Model(this.renderer, "spark")
        this.spark.material = new Material(this.renderer, "sparkMaterial", new SparkShader(this.renderer, "spark"))

        this.spark.material.depthWrite = false;

        this.spark.mesh = new Plane(this.renderer)

    }

    makeTransParent() {

        this.modelRenderer.addModel(this.mill.millControlePanel)
        for (let m of this.glFTLoader.modelsGlass) {

            m.material.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
            m.material.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["BlurLightPass"])
            this.modelRendererTrans.addModel(m)

        }
        this.modelRendererTrans.addModel(this.spark)
        this.modelRendererTrans.addModel(this.mill.sparkModel)

    }

    update() {
        /* UI.pushWindow("test")
     UI.LVector("pos",this.testPos)
             UI.popWindow()*/
        let w = Math.max(this.renderer.ratio * 3, GameModel.minRoomSize);


        let plantOff = (w - 5) / 2
        if (plantOff < 0) {
            this.plant.visible = false;
            this.pot.visible = false;
        } else {
            this.plant.visible = true;
            this.pot.visible = true;
            this.plant.setPosition(-2.200779914855957 - plantOff, 0.001604527235031128, -3.398457527160644)
            this.pot.setPosition(-2.200779914855957 - plantOff, 0.001604527235031128, -3.398457527160644)
        }
        let posterOff = (w - 3) / 2
        let posterOffX = 0
        let posterOffY = 0
        if (w > 5.5) {
            posterOffY = -0.5;
            posterOffX = 1;
        }
        this.posterLab.setPosition(posterOff + posterOffX, 2.5 + posterOffY, -2.2410359382629395)

        this.paintingHolder.setPosition((w - 1) / 2, 1.8256490230560303, -3.9360575675964355)
        let left = -w - 0.15;
        this.leftHolder.setPosition(left, 0, 0)

        this.centerHolder.setPosition(0, 0, 0)
        let right = w + 0.15;

        this.rightHolder.setPosition(right, 0, 0)
        this.glFTLoader.root.setPosition(0, -1.5, 0)
        this.hitLeftRoomCenter.setScale(Math.max(0, w - 4.4), 1, 1)
        this.hitRightRoom.setScale(w - 1.1, 1, 1)
        //  let bookPos = ((Math.abs(left) - 3.2) + 1.3) / 2; //right edge +left edge /2

        //this.bookCase.setPosition(bookPos, 0, -3.9)
        this.osc2Screen.update();
        this.osc1Screen.update();
        this.mill.update();
        this.machine.update();
        this.updateSparks()
    }

    setSpark() {

        if (GameModel.stateFashion == StateFasion.CAN_MAKE_TRIANGLE) {
            this.spark.setPositionV(this.laptopScreen.getWorldPos(new Vector3(-0.55, 0.1, -0.4)))
            return true;
        }
        if (GameModel.stateGrandpa == StateGrandpa.START) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["fishFood"].getWorldPos().add(new Vector3(0, 0.1, 0.1) as NumericArray));
            return true;
        }
        if (GameModel.stateHighTech == StateHighTech.PICK_FLOWER) {

            this.spark.setPositionV(GameModel.renderer.modelByLabel["coffeeMaker"].getWorldPos().add(new Vector3(0.00, 0.32, 0.19) as NumericArray));
            return true;
        }

        if (GameModel.stateGold == StateGold.FINISH_KEY) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["key"].getWorldPos().add(new Vector3(0.09, 0.03, 0.15) as NumericArray));
            return true;
        }
        if (GameModel.stateGold == StateGold.HAS_KEY || GameModel.stateGold == StateGold.START) {
            this.spark.setPositionV(GameModel.renderer.modelByLabel["bookCaseDoorLeft"].getWorldPos().add(new Vector3(0.60, 0.07, 0.12) as NumericArray));
            return true;
        }
        return false;
    }

    updateSparks() {
        if (!GameModel.currentTransition) this.nextSparkTime -= Timer.delta;
        if (this.nextSparkTime < 0) {


            this.nextSparkTime = 4 + Math.random() * 4;
            if (!this.setSpark()) return;
            let tl = gsap.timeline()
            tl.set(this, {sparkScale: 0.0}, 0);
            tl.to(this, {sparkScale: 0.17, duration: 0.15}, 0);
            tl.to(this, {sparkScale: 0.0, duration: 0.2}, 0.4);
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


}

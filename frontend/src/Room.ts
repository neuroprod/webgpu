import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import TextureLoader from "./lib/textures/TextureLoader";

import MainLight from "./MainLight";
import Object3D from "./lib/core/Object3D";
import {LaptopScreen} from "./extras/LaptopScreen";
import {FpsScreen} from "./extras/FpsScreen";
import ModelRenderer from "./lib/model/ModelRenderer";
import Mill from "./extras/Mill";

import {WindowOutside} from "./extras/WindowOutside";

import Scene from "./Scene";
import Clock from "./extras/Clock";
import {Osc2Screen} from "./extras/Osc2Screen";
import {Osc1Screen} from "./extras/Osc1Screen";
import Machine from "./extras/Machine";


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
    private fpsScreen: FpsScreen;
    private windowOutside: WindowOutside;
    private bookCase: Object3D;
    private hitLeftRoomCenter: Object3D;
    private hitRightRoom: Object3D;
    private osc2Screen: Osc2Screen;
    private osc1Screen: Osc1Screen;
    lightWallLiving: MainLight;
    lightTable: MainLight;
    machine:Machine;

    constructor(renderer: Renderer, preloader: PreLoader) {

        super(renderer, preloader, "room")
        new TextureLoader(this.renderer, preloader, "triangle.png", {});
        new TextureLoader(this.renderer, preloader, "text_s.png", {});
        new TextureLoader(this.renderer, preloader, "laptopEmail.png", {});
        new TextureLoader(this.renderer, preloader, "laptopText.png", {});

        new TextureLoader(this.renderer, preloader, "7dig.png", {});
        new TextureLoader(this.renderer, preloader, "glowPantsProgress.png", {});

    }

    init() {
        this.modelRenderer = new ModelRenderer(this.renderer, "room");
        this.modelRendererTrans = new ModelRenderer(this.renderer, "roomTrans");

        this.root = this.glFTLoader.root
        this.glFTLoader.root.setPosition(0, -1.5, 0)

        this.mill = new Mill(this.glFTLoader.modelsByName["mill"],this.renderer)
        for (let m of this.glFTLoader.models) {
            this.modelRenderer.addModel(m)

        }


        this.leftHolder = this.glFTLoader.objectsByName["left"]
        this.rightHolder = this.glFTLoader.objectsByName["right"]
        this.centerHolder = this.glFTLoader.objectsByName["center"]
        this.bookCase = this.glFTLoader.objectsByName["bookCase"];

        this.hitLeftRoomCenter = this.glFTLoader.objectsByName["_HitLeftRoomCenter"]
        this.hitRightRoom = this.glFTLoader.objectsByName["_HitRightRoom"];



        this.lightWallLiving= new MainLight(this.renderer, "lightWallLiving")
        this.glFTLoader.modelsByName["wallLampLamp"].addChild(this.lightWallLiving)
        this.glFTLoader.modelsByName["wallLampLamp"].castShadow = false;

        this.lightTable= new MainLight(this.renderer, "lightTable")
        this.glFTLoader.modelsByName["tableLampCap"].addChild( this.lightTable)
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
        this.modelRenderer.addModel(this.laptopScreen);

        this.fpsScreen = new FpsScreen(this.renderer, this.glFTLoader.objectsByName["powersup"]);
        this.modelRenderer.addModel(this.fpsScreen);

        this.osc2Screen = new Osc2Screen(this.renderer, this.glFTLoader.objectsByName["ossiloscope2"]);
        this.modelRenderer.addModel(this.osc2Screen);

        this.osc1Screen = new Osc1Screen(this.renderer, this.glFTLoader.objectsByName["oscilloscope"]);
        this.modelRenderer.addModel(this.osc1Screen);

        this.clock = new Clock(this.glFTLoader.modelsByName["hour"], this.glFTLoader.modelsByName["minutes"])
        this.machine =new Machine(this.renderer);
     //   this.windowOutside = new WindowOutside(this.renderer, this.glFTLoader.objectsByName["windowIn"]);
      //  this.modelRenderer.addModel(this.windowOutside);

    }

    makeTransParent() {


        for (let m of this.glFTLoader.modelsGlass) {

            m.material.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
            m.material.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["BlurLightPass"])
            this.modelRendererTrans.addModel(m)

        }
        this.modelRendererTrans.addModel(this.mill.sparkModel)
    }

    update() {
        let left = -this.renderer.ratio * 3 - 0.15;
        this.leftHolder.setPosition(left, 0, 0)

        this.centerHolder.setPosition(0, 0, 0)
        this.rightHolder.setPosition(this.renderer.ratio * 3 + 0.15, 0, 0)
        this.glFTLoader.root.setPosition(0, -1.5, 0)
        this.hitLeftRoomCenter.setScale(Math.max(0, this.renderer.ratio * 3 - 4.4), 1, 1)
        this.hitRightRoom.setScale(this.renderer.ratio * 3 - 1.1, 1, 1)
      //  let bookPos = ((Math.abs(left) - 3.2) + 1.3) / 2; //right edge +left edge /2

        //this.bookCase.setPosition(bookPos, 0, -3.9)
        this.osc2Screen.update();
        this.osc1Screen.update();
        this.mill.update();
this.machine.update();
    }


}

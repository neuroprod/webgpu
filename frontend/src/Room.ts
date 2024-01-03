import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import TextureLoader from "./lib/textures/TextureLoader";
import GLFTLoader from "./GLFTLoader";
import MainLight from "./MainLight";
import Object3D from "./lib/core/Object3D";
import {LaptopScreen} from "./extras/LaptopScreen";
import {FpsScreen} from "./extras/FpsScreen";
import ModelRenderer from "./lib/model/ModelRenderer";
import Mill from "./extras/Mill";
import Ray from "./lib/Ray";
import GameModel from "./GameModel";
import {WindowOutside} from "./extras/WindowOutside";
import UI from "./lib/UI/UI";
import Scene from "./Scene";
import Clock from "./extras/Clock";

export default class Room extends Scene{
    leftHolder: Object3D;
    rightHolder: Object3D;
    centerHolder: Object3D;
    mainLight: MainLight;

    modelRenderer: ModelRenderer;
    modelRendererTrans: ModelRenderer;
    root: Object3D;


    private laptopScreen: LaptopScreen;
    private fpsScreen: FpsScreen;
    private mill: Mill;
    private windowOutside: WindowOutside;
    private bookCase: Object3D;
    private hitLeftRoomCenter: Object3D;
    private hitRightRoom: Object3D;
    private clock: Clock;


    constructor(renderer: Renderer, preloader: PreLoader) {

        super(renderer,preloader,"room")
        new TextureLoader(this.renderer, preloader, "triangle.png", {});
        new TextureLoader(this.renderer, preloader, "text_s.png", {});
        new TextureLoader(this.renderer, preloader, "7dig.png", {});



    }

    init() {
        this.modelRenderer = new ModelRenderer(this.renderer, "room");
        this.modelRendererTrans = new ModelRenderer(this.renderer, "roomTrans");

        this.root = this.glFTLoader.root
        this.glFTLoader.root.setPosition(0, -1.5, 0)

        this.mill = new Mill(this.glFTLoader.objectsByName["mill"])
        for (let m of this.glFTLoader.models) {
            this.modelRenderer.addModel(m)

        }


        this.leftHolder = this.glFTLoader.objectsByName["left"]
        this.rightHolder = this.glFTLoader.objectsByName["right"]
        this.centerHolder = this.glFTLoader.objectsByName["center"]
        this.bookCase =  this.glFTLoader.objectsByName["bookCase"];

        this.hitLeftRoomCenter = this.glFTLoader.objectsByName["_HitLeftRoomCenter"]
        this.hitRightRoom = this.glFTLoader.objectsByName["_HitRightRoom"];

        this.mainLight = new MainLight(this.renderer)
        this.glFTLoader.objectsByName["mainLight"].addChild(this.mainLight)
        this.glFTLoader.objectsByName["mainLight"].castShadow = false


        this.laptopScreen = new LaptopScreen(this.renderer, this.glFTLoader.objectsByName["labtop"]);
        this.modelRenderer.addModel(this.laptopScreen);
        this.fpsScreen = new FpsScreen(this.renderer, this.glFTLoader.objectsByName["powersup"]);
        this.modelRenderer.addModel(this.fpsScreen);


        this.clock =new Clock(  this.glFTLoader.modelsByName["hour"],     this.glFTLoader.modelsByName["minutes"])

        this.windowOutside = new WindowOutside(this.renderer, this.glFTLoader.objectsByName["windowIn"]);
        this.modelRenderer.addModel( this.windowOutside );

    }

    makeTransParent() {
        for (let m of this.glFTLoader.modelsGlass) {

            m.material.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
            m.material.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["BlurLightPass"])
            this.modelRendererTrans.addModel(m)

        }
    }
    update() {
        let left = -this.renderer.ratio * 3-0.15;
        this.leftHolder.setPosition(left,  0, 0)

        this.centerHolder.setPosition(0, 0, 0)
        this.rightHolder.setPosition(this.renderer.ratio * 3+0.15 , 0, 0)
        this.glFTLoader.root.setPosition(0, -1.5, 0)
        this.hitLeftRoomCenter.setScale(Math.max(0,this.renderer.ratio * 3-4.4),1,1)
        this.hitRightRoom.setScale(this.renderer.ratio * 3-1.1,1,1)
        let bookPos =( (Math.abs(left)-3.2)+1.3)/2; //right edge +left edge /2

       this.bookCase.setPosition(bookPos,0,-3.9)

        this.mill.update();
    }


    onUIGame() {
        this.clock.onUI();
    }
}

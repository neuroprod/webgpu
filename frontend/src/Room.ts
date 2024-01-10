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
import {Osc2Screen} from "./extras/Osc2Screen";
import {Osc1Screen} from "./extras/Osc1Screen";

export default class Room extends Scene{
    leftHolder: Object3D;
    rightHolder: Object3D;
    centerHolder: Object3D;


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
    public lightKitchen: MainLight;
    public lightLab: MainLight;
    public lightDoor: MainLight;
    public lightWall: MainLight;
    private osc2Screen: Osc2Screen;
    private osc1Screen: Osc1Screen;


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

        this.lightKitchen  = new MainLight(this.renderer,"mainLightKitchen")
        this.glFTLoader.modelsByName["mainLight"].addChild( this.lightKitchen)
        this.glFTLoader.modelsByName["mainLight"].castShadow =false;
        this.lightLab = new MainLight(this.renderer,"mainLightLab")
        this.glFTLoader.objectsByName["LightComp"].addChild(this.lightLab);
        this.glFTLoader.modelsByName["LightComp"].castShadow =false;


        this.lightDoor = new MainLight(this.renderer,"lightDoor")
        this.glFTLoader.objectsByName["lightDoor"].addChild(this.lightDoor);
        this.glFTLoader.modelsByName["lightDoor"].castShadow =false;


        this.lightWall = new MainLight(this.renderer,"lightWall")
        this.glFTLoader.objectsByName["lightWall"].addChild( this.lightWall);
        this.glFTLoader.modelsByName["lightWall"].castShadow =false;


        this.laptopScreen = new LaptopScreen(this.renderer, this.glFTLoader.objectsByName["labtop"]);
        this.modelRenderer.addModel(this.laptopScreen);

        this.fpsScreen = new FpsScreen(this.renderer, this.glFTLoader.objectsByName["powersup"]);
        this.modelRenderer.addModel(this.fpsScreen);

        this.osc2Screen = new Osc2Screen(this.renderer, this.glFTLoader.objectsByName["ossiloscope2"]);
        this.modelRenderer.addModel( this.osc2Screen);

        this.osc1Screen = new Osc1Screen(this.renderer, this.glFTLoader.objectsByName["oscilloscope"]);
        this.modelRenderer.addModel( this.osc1Screen);

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
        this.osc2Screen.update();
        this.osc1Screen.update();
        this.mill.update();
    }


    onUIGame() {
        this.clock.onUI();
    }
}

import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel, {UIState} from "../GameModel";
import gsap from "gsap";
import CloseButton from "./CloseButton";
import UseButton from "./UseButton";

export default class InventoryDetail extends UIBitmapModel{



    private closeButton: CloseButton;
    private yOff: number=0;

    private useButton: UseButton;
    private id: number;

    constructor(renderer:Renderer,preLoader:PreLoader) {
        super(renderer,preLoader,"inventoryDetail","UI/itemDetail.png");
        this.visible =false;

        this.closeButton =new CloseButton(renderer,preLoader,"closeMenu")
        this.closeButton.setPosition(490,-360,0);
        this.addChild(this.closeButton)
        this.closeButton.onClick=()=>{
            GameModel.sound.playClick()
            GameModel.sound.playWoosh()
            GameModel.setUIState(UIState.GAME_DEFAULT);
        }
        this.useButton =new UseButton(renderer,preLoader)
        this.useButton.setPosition(350,320,0);
        this.addChild(  this.useButton)
        this.useButton.onClick=()=>{
            GameModel.sound.playClick()
            GameModel.sound.playWoosh()
            GameModel.setUIState(UIState.GAME_DEFAULT);
            GameModel.usePants(this.id);
        }


    }
    update() {
        super.update();
        this.setPosition(GameModel.screenWidth/2,GameModel.screenHeight/2+this.yOff,0)

    }

    hide(){

        gsap.killTweensOf(this);

        gsap.to(this,{yOff:-50,duration:0.1,ease:"power2.in",onComplete:()=>{   this.visible =false;}})
    }
    show(data:any) {
        this.id = data as number
        gsap.killTweensOf(this);
        this.yOff =-50;
        gsap.to(this,{yOff:0,duration:0.3,ease:"back.out"})
        this.visible =true;
    }
}


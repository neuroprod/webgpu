import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel, {UIState} from "../GameModel";
import gsap from "gsap";
import CloseButton from "./CloseButton";

export default class Menu extends UIBitmapModel{
    private yPos: number=133/2-20;
    private closeButton: CloseButton;
    private yOff: number=0;

    constructor(renderer:Renderer,preLoader:PreLoader) {
        super(renderer,preLoader,"menu","UI/mainMenu.png");
        this.visible =false;

        this.closeButton =new CloseButton(renderer,preLoader,"closeMenu")
        this.closeButton.setPosition(470,-360,0);
        this.addChild(this.closeButton)
        this.closeButton.onClick=()=>{
            GameModel.setUIState(UIState.GAME_DEFAULT);
            GameModel.sound.playClick()
        }
    }
    update() {
        super.update();
        this.setPosition(GameModel.screenWidth/2,GameModel.screenHeight/2+this.yOff,0)

    }

    hide(){

        gsap.killTweensOf(this);
        GameModel.sound.playWoosh()
        gsap.to(this,{yOff:-50,duration:0.1,ease:"power2.in",onComplete:()=>{   this.visible =false;}})
    }
    show() {
        GameModel.sound.playWoosh()
        gsap.killTweensOf(this);
        this.yOff =-50;
        gsap.to(this,{yOff:0,duration:0.3,ease:"back.out"})
        this.visible =true;
    }
}


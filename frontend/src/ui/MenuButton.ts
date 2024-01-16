import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel, {UIState} from "../GameModel";
import gsap from "gsap";

export default class MenuButton extends UIBitmapModel{
    private yPos: number=30;
    private isHiding: boolean =false;

    constructor(renderer:Renderer,preLoader:PreLoader) {
        super(renderer,preLoader,"menuBtn","UI/menuBtn.png");
    }
    update() {
        super.update();
        this.setPosition(GameModel.screenWidth-50,this.yPos,0)
    }

    onOver() {
        if( this.isHiding)return
        GameModel.sound.playButton()
        super.onOver();
        gsap.killTweensOf(this);
        gsap.to(this,{yPos:35,duration:0.3,ease:"back.out"})
    }
    onOut() {
        if( this.isHiding)return
        GameModel.sound.playButton()
        super.onOut();
        gsap.killTweensOf(this);
        gsap.to(this,{yPos:30,duration:0.3,ease:"back.out"})
    }
    hide(){
        this.isHiding =true;
        this.mouseEnabled =false
        gsap.killTweensOf(this);
        gsap.to(this,{yPos:-30,duration:0.3,ease:"back.out"})
    }
    show(){
        this.isHiding =false;
        this.mouseEnabled =true;
        gsap.killTweensOf(this);
        gsap.to(this,{yPos:30,duration:0.3,ease:"back.out"})
    }
    onClick() {
        if( this.isHiding)return
        super.onClick();
        GameModel.setUIState(UIState.OPEN_MENU)
    }

}
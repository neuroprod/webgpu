import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel, {UIState} from "../GameModel";
import gsap from "gsap";
import InventoryButton from "./InventoryButton";

export default class Inventory extends UIBitmapModel{
private yPos: number=133/2-20;
    private item1: InventoryButton;

    constructor(renderer:Renderer,preLoader:PreLoader) {
        super(renderer,preLoader,"inventory","UI/inventory.png");
        this.item1 =new InventoryButton(this.renderer,preLoader,"UI/inventoryItem.png",0);
        this.addChild(this.item1);
    }
    update() {
        super.update();
        this.setPosition(GameModel.screenWidth/2,GameModel.screenHeight+this.yPos,0)


    }

    onOver() {
        super.onOver();
        GameModel.sound.playButton()
        gsap.killTweensOf(this);
        gsap.to(this,{yPos:-133/2+20,duration:0.3,ease:"back.out"})
    }
    onOut() {
        super.onOut();
        gsap.killTweensOf(this);
        GameModel.sound.playButton()
        gsap.to(this,{yPos:133/2-20,duration:0.3,ease:"back.out"})
    }
    onClick() {
        GameModel.setUIState(UIState.INVENTORY_DETAIL)
    }
    hide(){
        gsap.killTweensOf(this);
        gsap.to(this,{yPos:133/2,duration:0.3,ease:"back.out"})
    }
    show(){
        gsap.killTweensOf(this);
        gsap.to(this,{yPos:133/2-20,duration:0.3,ease:"back.out"})
    }
}


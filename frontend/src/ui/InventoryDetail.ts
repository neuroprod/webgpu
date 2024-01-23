import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel, {UIState} from "../GameModel";
import gsap from "gsap";
import CloseButton from "./CloseButton";
import UseButton from "./UseButton";
import UIModel from "../lib/model/UIModel";

export default class InventoryDetail extends UIModel{



    private closeButton: CloseButton;
    private yOff: number=0;

    private useButton: UseButton;
    private id: number;
private items:Array<UIBitmapModel>=[];
    private uiScale: number=1;
    constructor(renderer:Renderer,preLoader:PreLoader) {
        super(renderer,"inventoryDetail");
        this.visible =false;





        this.closeButton =new CloseButton(renderer,preLoader,"closeMenu")
        this.closeButton.setPosition(490,-360,0);
        this.addChild(this.closeButton)
        this.closeButton.onClick=()=>{
            GameModel.sound.playClick()
            GameModel.sound.playWoosh()
            GameModel.setUIState(UIState.GAME_DEFAULT);
            GameModel.characterHandler.characterRot=0;
        }
        this.useButton =new UseButton(renderer,preLoader)
        this.useButton.setPosition(370,320,0);
        this.addChild(  this.useButton)
        this.useButton.onClick=()=>{
            GameModel.sound.playPop()
            GameModel.sound.playWoosh()
            GameModel.setUIState(UIState.GAME_DEFAULT);
            GameModel.usePants(this.id);
            GameModel.characterHandler.characterRot=0;

            GameModel.characterHandler.pullPants()
        }

        let item1=new UIBitmapModel(renderer,preLoader,"item1","UI/info1.png")
        this.addChild(item1)
        this.items.push(item1)
        let item2=new UIBitmapModel(renderer,preLoader,"item2","UI/info2.png")
        this.addChild(item2)
        this.items.push(item2)

    }
    update() {
        super.update();
        this.setPosition(GameModel.screenWidth/2,GameModel.screenHeight/2+this.yOff,0)
        if(GameModel.screenHeight>1000){
            this.uiScale =1;
        }else{
            this.uiScale =GameModel.screenHeight/1000;
        }
        this.setScale(this.uiScale,this.uiScale,this.uiScale)
    }

    hide(){

        gsap.killTweensOf(this);

        gsap.to(this,{yOff:-50,duration:0.1,ease:"power2.in",onComplete:()=>{   this.visible =false;}})
    }
    show(data:any) {
        this.id = data as number
        for(let i=0;i<this.items.length;i++){
            let vis =false
            if(i==this.id)vis =true;
            this.items[i].visible =vis;

        }


        gsap.killTweensOf(this);
        this.yOff =-50;
        gsap.to(this,{yOff:0,duration:0.3,ease:"back.out"})
        this.visible =true;
    }
}


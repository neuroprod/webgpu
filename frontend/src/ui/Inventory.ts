import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel, {UIState} from "../GameModel";
import gsap from "gsap";
import InventoryButton from "./InventoryButton";


export default class Inventory extends UIBitmapModel{
    //182/878
    private h =182;
    private yPos: number=110/2;
    private btns:Array< InventoryButton>=[];
    private openBtn: UIBitmapModel;
    private isOpen =false;
    private closePos =-25;
    constructor(renderer:Renderer,preLoader:PreLoader) {
        super(renderer,preLoader,"inventory","UI/inventory.png");
        this.yPos=this.closePos;
        for(let i=0;i<6;i++){
            let posX = -350+i*135;
            let btn =new InventoryButton(this.renderer,preLoader,"UI/pants_"+(i+1)+".png",i,posX);
            this.addChild(btn);
            this.btns.push(btn)
        }
        this.material.uniforms.setUniform("alpha",1.0)
        this.openBtn =new UIBitmapModel(renderer,preLoader,"open","UI/inventoryButton.png")
        this.openBtn.setPosition(-275,50,0)
        this.addChild(this.openBtn);
        this.openBtn.onClick =this.tryOpen.bind(this)
        this.updateInventory()
    }
    update() {
        super.update();
        this.setPosition(878/2,this.yPos,0)


    }


    hide(){
        gsap.killTweensOf(this);
        gsap.to(this,{yPos:-this.h/2,duration:0.3,ease:"back.out"})
    }
    show(){
        gsap.killTweensOf(this);
        this.isOpen =false;
        gsap.to(this,{yPos:this.closePos,duration:0.3,ease:"back.out"})
    }

    private tryOpen() {
        gsap.killTweensOf(this);
        GameModel.sound.playClick()
        //GameModel.sound.playWoosh(0.1)
        if(this.isOpen){
            gsap.to(this,{yPos:this.closePos,duration:0.3,ease:"back.out"})
      }else{
          gsap.to(this,{yPos:this.h/2,duration:0.3,ease:"back.out"})
      }
        this.isOpen =!this.isOpen;

    }

    updateInventory() {


        for(let i=0;i<6;i++){

            if( GameModel.pantsFound<i){

                this.btns[i].visible =false;
            }else{

                this.btns[i].visible =true;
            }


        }
    }
}


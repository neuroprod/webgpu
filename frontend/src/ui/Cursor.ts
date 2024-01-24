import UIBitmapModel from "../lib/model/UIBitmapModel";

import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import {Vector2, Vector3} from "math.gl";

import UIModel from "../lib/model/UIModel";
import CursorIcon from "./CursorIcon";
import Timer from "../lib/Timer";
import CursorIconArrow from "./CursorIconArrow";

export enum CURSOR{
    ARROW_LEFT,
    ARROW_RIGHT,
    LOOK,
    WALK,
    NEXT,
}


export default class Cursor extends  UIModel{

    private target =new Vector3()
    private pos =new Vector3()
    private arrowLeft: CursorIcon;
    private arrowRight: CursorIcon;
    private look: CursorIcon;
    private walk: CursorIcon
    private next: CursorIcon;

    private icons:Array<CursorIcon>=[];
    private currentIcon: CursorIcon;
    private showFrame: number=0;

    constructor(renderer:Renderer,preLoader:PreLoader) {
        super(renderer,"cursor");
        this.mouseEnabled =false;

        this.arrowLeft = new CursorIconArrow(renderer,preLoader,"arrowLeft","UI/arrowLeft.png")
        this.icons.push(  this.arrowLeft)
        this.arrowRight = new CursorIconArrow(renderer,preLoader,"arrowRight","UI/arrowRight.png")
        this.icons.push(this.arrowRight)
        this.look = new CursorIcon(renderer,preLoader,"look","UI/look.png")

        this.icons.push( this.look)
        this.walk= new CursorIcon(renderer,preLoader,"walk","UI/walk.png")
        this.icons.push( this.walk)


        this.next= new CursorIcon(renderer,preLoader,"next","UI/arrowRight.png")
        this.icons.push(this.next)

        for (let i of this.icons){
            this.addChild(i)
            i.mouseEnabled =false;
            i.visible =false;
        }

    }


    setMousePos(mousePos: Vector2) {

        let offX =50
        if(this.currentIcon==this.arrowRight){
            offX =-50
        }
        this.target.set(mousePos.x+offX,mousePos.y-20,0)

    }
    update() {
        super.update();
        this.pos.lerp(this.target,1);

        this.setPosition(this.pos.x,this.pos.y,0)


    }

    show(cursor: CURSOR) {
        for (let i of this.icons){
            i.visible =false;
        }
        this.currentIcon =  this.icons[cursor];

        this.currentIcon.show();

       // this.currentIcon.setPosition(    this.currentIcon.textureWidth,0,0)
        this.pos.from(this.target)
        this.showFrame =Timer.frame


    }
    hide(){
        if(Timer.frame==this.showFrame)return;

        for (let i of this.icons){
            if (i!= this.currentIcon)
            {i.visible =false;}
        }
        if(this.currentIcon)this.currentIcon.hide()
    }

    animate() {
        this.currentIcon.animate()
    }
}

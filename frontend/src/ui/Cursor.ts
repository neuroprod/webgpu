import UIBitmapModel from "../lib/model/UIBitmapModel";

import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import {Vector2, Vector3} from "math.gl";

import UIModel from "../lib/model/UIModel";
import CursorIcon from "./CursorIcon";
import Timer from "../lib/Timer";
import CursorIconArrow from "./CursorIconArrow";
import CursorIconWalk from "./CursorIconWalk";

export enum CURSOR{
    ARROW_LEFT,
    ARROW_RIGHT,
    LOOK,
    WALK,
    NEXT,
    DIG,
    FISH,
    FLOWER,
    KEY,
    START,
    STICK,
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
        this.walk= new CursorIconWalk(renderer,preLoader,"walk","UI/next.png")
        this.icons.push( this.walk)


        this.next= new CursorIcon(renderer,preLoader,"next","UI/next.png")
        this.icons.push(this.next)

        let dig= new CursorIcon(renderer,preLoader,"dig","UI/dig.png")
        this.icons.push(dig)

        let fish= new CursorIcon(renderer,preLoader,"fish","UI/fish.png")
        this.icons.push(fish)

        let flower= new CursorIcon(renderer,preLoader,"flower","UI/flower.png")
        this.icons.push(flower)

        let key= new CursorIcon(renderer,preLoader,"key","UI/key.png")
        this.icons.push(key)

        let start= new CursorIcon(renderer,preLoader,"dig","UI/start.png")
        this.icons.push(start)

        let stick= new CursorIcon(renderer,preLoader,"stick","UI/stick.png")
        this.icons.push(stick)



        for (let i of this.icons){
            this.addChild(i)
            i.mouseEnabled =false;
            i.visible =false;
        }

    }


    setMousePos(mousePos: Vector2) {

        let offX =30
        let offY =-20
        if(this.currentIcon==this.arrowRight){
            offX =-30
        }
        if(this.currentIcon==this.next){
            offX =0
            offY =0
        }
        this.target.set(mousePos.x+offX,mousePos.y+offY,0)

    }
    update() {
        if(!this.visible)return;
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

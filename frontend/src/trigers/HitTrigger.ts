import Trigger from "./Trigger";
import GameModel, {Scenes} from "../GameModel";
import {isArray} from "math.gl";


export default class HitTrigger extends Trigger{

    protected objectLabels: Array<string>=[];
    constructor(scene:Scenes,objectLabel:string|Array<string>) {
        super(scene);
        if(isArray(objectLabel)){
            this.objectLabels =objectLabel as Array<string>;
        }else{
            this.objectLabels.push(objectLabel as string);
        }


    }
    check() {
        if(!super.check())return false;

        if(GameModel.mouseDownThisFrame){
            if(this.objectLabels.includes(GameModel.hitObjectLabel)){
                this.click()
            }

        }


        if(!GameModel.hitStateChange)return
        if(this.objectLabels.includes(GameModel.hitObjectLabel)) {
           this.over()
            return true;
        }
        if(this.objectLabels.includes(GameModel.hitObjectLabelPrev )) {
            this.out()
            return true;
        }




    }

    protected over() {
        //UI.logEvent("Over", this.objectLabel);
    }

    protected out() {
      //  UI.logEvent("Out", this.objectLabel);
    }

    protected click() {

    }
}

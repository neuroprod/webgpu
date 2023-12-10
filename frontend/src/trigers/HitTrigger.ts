import Trigger from "./Trigger";
import GameModel, {Scenes} from "../GameModel";
import UI from "../lib/UI/UI";

export default class HitTrigger extends Trigger{
    protected objectLabel: string;
    constructor(scene:Scenes,objectLabel:string) {
        super(scene);
        this.objectLabel =objectLabel;

    }
    check() {
        if(!super.check())return false;

        if(GameModel.mouseDownThisFrame){
            if(GameModel.hitObjectLabel ==this.objectLabel){
                this.click()
            }

        }


        if(!GameModel.hitStateChange)return
        if(GameModel.hitObjectLabel ==this.objectLabel) {
           this.over()
            return true;
        }
        if(GameModel.hitObjectLabelPrev ==this.objectLabel) {
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

import Trigger from "./Trigger";
import GameModel, {Scenes} from "../GameModel";
import UI from "../lib/UI/UI";

export default class HitTrigger extends Trigger{
    private objectLabel: string;
    constructor(scene:Scenes,objectLabel:string) {
        super(scene);
        this.objectLabel =objectLabel;

    }
    check() {
        if(!super.check())return false;
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

    private over() {
        //UI.logEvent("Over", this.objectLabel);
    }

    private out() {
      //  UI.logEvent("Out", this.objectLabel);
    }
}

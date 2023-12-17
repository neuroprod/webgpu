import Trigger from "./Trigger";
import GameModel, {Scenes} from "../GameModel";
import UI from "../lib/UI/UI";
import {Vector3} from "math.gl";

export class FloorHitTrigger extends Trigger {
    private objectLabels: Array<String>;
    private hit: boolean = false;


    constructor(scene: Scenes, objectLabels: Array<String>) {
        super(scene);
        this.objectLabels = objectLabels;

    }

    check() {
        if (!super.check()) return false;

        if (this.objectLabels.includes(GameModel.hitObjectLabel)) {

            this.update()

            if (!this.hit) {
                this.over()
            }
            this.hit = true;
            if(GameModel.mouseDownThisFrame){
                this.click();
            }



        } else {
            if (this.hit) {
                this.hit = false;
                this.out()
            }
        }





    }

    protected over() {
        //UI.logEvent("Over", this.objectLabel);
        GameModel.floorHitIndicator.visible =true;
    }

    protected out() {
        //  UI.logEvent("Out", this.objectLabel);
        GameModel.floorHitIndicator.visible =false;
    }

    protected click() {

        GameModel.characterHandler.walkTo(GameModel.hitWorldPos,new Vector3(0,0,0))
    }


    private update() {
        GameModel.floorHitIndicator.setPosition(GameModel.hitWorldPos.x,GameModel.hitWorldPos.y,GameModel.hitWorldPos.z);
       // UI.logEvent("HITFLOOR"," pos:"+  GameModel.hitWorldPos)

    }
}

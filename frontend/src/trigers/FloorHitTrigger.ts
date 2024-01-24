import Trigger from "./Trigger";
import GameModel, {Scenes} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

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

        GameModel.gameUI.cursor.show(CURSOR.WALK)
    }

    protected out() {
        //  UI.logEvent("Out", this.objectLabel);
        GameModel.gameUI.cursor.hide()
    }

    protected click() {
//console.log(GameModel.hitWorldPos)
        GameModel.gameUI.cursor.animate()
        GameModel.characterHandler.walkTo(GameModel.hitWorldPos,0)
    }


}

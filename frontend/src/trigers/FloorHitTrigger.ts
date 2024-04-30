import GameModel from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";
import HitTrigger from "./HitTrigger";

export class FloorHitTrigger extends HitTrigger {

    private hit: boolean = false;


    check() {
        if (!super.check()) return false;

        if (this.objectLabels.includes(GameModel.hitObjectLabel)) {


            if (!this.hit) {
                this.over()
            }
            this.hit = true;
            if (GameModel.mouseDownThisFrame) {
                this.click();
            }


        } else {

            if (this.hit) {
                this.hit = false;
                this.out()

            }
            this.hit = false;
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
        GameModel.characterHandler.walkTo(GameModel.hitWorldPos, 0)
    }


}

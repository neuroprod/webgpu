import HitTrigger from "./HitTrigger";
import GameModel, {StateGrandpa, StateHunter, Transitions} from "../GameModel";
import {Vector3} from "math.gl";
import {CURSOR} from "../ui/Cursor";

export default class DoorGoInsideTrigger extends HitTrigger {

    onCompleteWalk() {
        GameModel.setTransition(Transitions.GO_INSIDE)
        let door = GameModel.renderer.modelByLabel["door"]
        let world = door.getWorldPos(new Vector3(0, 0, 0.5))
        GameModel.characterHandler.walkTo(world, 0, () => {
        }, false)
    }

    protected click() {
        if (GameModel.stateGrandpa != StateGrandpa.START) {
            if (GameModel.stateGrandpa == StateGrandpa.SHOW_GRANDPA_PANTS || GameModel.stateGrandpa == StateGrandpa.FEED_FISH || GameModel.stateGrandpa == StateGrandpa.TAKE_FISH_FOOD|| GameModel.stateHunter == StateHunter.START) {
                if(GameModel.stateGrandpa == StateGrandpa.TAKE_FISH_FOOD){
                    GameModel.setTransition(Transitions.TEXT_INFO, "shouldFeedTheFish");
                }else{
                    GameModel.setTransition(Transitions.TEXT_INFO, "doStuffOutside");
                }

                return;
            }
        }
        let door = GameModel.renderer.modelByLabel["door"]
        let world = door.getWorldPos(new Vector3(0, 0, 1))
        GameModel.characterHandler.walkTo(world, 0, this.onCompleteWalk, true)
        GameModel.hitObjectLabel = ""
    }

    protected over() {
        //UI.logEvent("Over", this.objectLabel);

        GameModel.gameUI.cursor.show(CURSOR.ARROW_RIGHT)
    }

    protected out() {
        //  UI.logEvent("Out", this.objectLabel);
        GameModel.gameUI.cursor.hide()
    }
}

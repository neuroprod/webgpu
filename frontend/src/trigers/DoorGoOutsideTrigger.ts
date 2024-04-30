import HitTrigger from "./HitTrigger";
import GameModel, {Pants, StateGold, Transitions} from "../../public/GameModel";
import {Vector3} from "math.gl";
import {CURSOR} from "../ui/Cursor";

export default class DoorGoOutsideTrigger extends HitTrigger {

    protected click() {
        //GameModel.getDrawingByLabel("chapter1_world").visible =false
        if (GameModel.stateGold == StateGold.FINISH_KEY) {
            GameModel.setTransition(Transitions.TEXT_INFO, "checkKey");
            return
        }
        // console.log( GameModel.pantsFound)
        if (GameModel.stateGold != StateGold.FIND_NOTE && GameModel.pantsFound.length == 6) {
            GameModel.setTransition(Transitions.TEXT_INFO, "finishUpInsideLate");
            return
        }
        if (!GameModel.pantsFound.includes(Pants.glow) && GameModel.pantsFound.length == 5) {
            GameModel.setTransition(Transitions.TEXT_INFO, "finishUpInsideLate");
            return
        }

        GameModel.sound.playClick(0.2)

        let doorOutside = GameModel.renderer.modelByLabel["door_HO"]
        let world = doorOutside.getWorldPos(new Vector3(1, 0, 0))
        GameModel.characterHandler.walkTo(world, 0, this.onCompleteWalk, true)
        GameModel.hitObjectLabel = ""
    }

    onCompleteWalk() {
        GameModel.setTransition(Transitions.GO_OUTSIDE);
        let doorOutside = GameModel.renderer.modelByLabel["door_HO"]
        let world = doorOutside.getWorldPos(new Vector3(0.5, 0, 0))
        GameModel.characterHandler.walkTo(world, 0, () => {
        }, false)
    }

    protected over() {
        //UI.logEvent("Over", this.objectLabel);

        GameModel.gameUI.cursor.show(CURSOR.ARROW_LEFT)
    }

    protected out() {
        //  UI.logEvent("Out", this.objectLabel);
        GameModel.gameUI.cursor.hide()
    }
}

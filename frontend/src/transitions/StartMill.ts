import Transition from "./Transition";
import GameModel, {MillState, StateGold} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class StartMill extends Transition {


    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.characterHandler.setAnimationOnce("startMill", 0.3, () => {
            GameModel.setMillState(MillState.ON)
            GameModel.characterHandler.setAnimation("idle", 0.5);
        })
        GameModel.textHandler.showHitTrigger("millRun")

        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.stateGold = StateGold.START_MILL
    }

    onMouseDown() {
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            GameModel.stateGold = StateGold.START_MILL;

            if (GameModel.pantsFound.length >= 6) {

                setTimeout(() => {
                    if (GameModel.stateGold == StateGold.START_MILL)
                        GameModel.stateGold = StateGold.FINISH_KEY;
                }, 3000)

            }

            this.onComplete()
        }
    }
}

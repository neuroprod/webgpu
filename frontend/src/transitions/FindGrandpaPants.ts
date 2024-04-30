import Transition from "./Transition";
import GameModel, {Pants, StateGrandpa, UIState} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindGrandpaPants extends Transition {
    private lock: boolean = false;


    set(onComplete: () => void) {
        super.set(onComplete)

        this.lock = false,
            GameModel.textHandler.showHitTrigger("findGrandpaPants")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setMixAnimation("lookdown", 1, 1)
        GameModel.characterHandler.face.lookDown()
    }

    onCrunchDown() {
        GameModel.characterHandler.setIdleAndTurn()
        GameModel.pantsFound.push(Pants.grandpa);
        GameModel.gameUI.updateInventory();
        GameModel.sound.playPickPants();
        GameModel.gameUI.cursor.hide()
        GameModel.characterHandler.setMixAnimation("lookdown", 0, 0.2)
        GameModel.characterHandler.setMixAnimation("grabGlowPants", 0, 0.2)
        GameModel.stateGrandpa = StateGrandpa.TAKE_GRANDPA_PANTS;
        GameModel.clock.addTime()
        GameModel.characterHandler.face.setToBase()
        this.onComplete()
        // if(GameModel.pantsFound.length==3)   GameModel.getDrawingByLabel("chapter2_world").show()
        GameModel.setUIState(UIState.INVENTORY_DETAIL, Pants.grandpa)
    }

    onMouseDown() {
        if (this.lock) return;
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            this.lock = true;
            GameModel.characterHandler.setAnimationOnce("crunchDown", 0.2, this.onCrunchDown.bind(this))

            GameModel.characterHandler.setMixAnimation("grabGlowPants", 1, 0.5)
        }
    }
}

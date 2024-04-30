import Transition from "./Transition";
import GameModel, {Pants, StateGirl, UIState} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindGirlpaPants extends Transition {

    lock = false;

    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("findGirlPants")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setMixAnimation("lookdown", 1, 0.5)
        GameModel.characterHandler.face.lookDown()
        this.lock = false;
    }

    onMouseDown() {
        if (this.lock) return;
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {
            this.lock = true;
            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setMixAnimation("lookdown", 0, 0.5)
            GameModel.characterHandler.setAnimationOnce("crunchDown", 0.2, this.onCrunchDown.bind(this))
            GameModel.characterHandler.setMixAnimation("grabGlowPants", 1, 0.5)

        }
    }

    onCrunchDown() {
        GameModel.pantsFound.push(Pants.girl);
        GameModel.gameUI.updateInventory();
        GameModel.sound.playPickPants();

        GameModel.stateGirl = StateGirl.TAKE_GIRL_PANTS;

        GameModel.characterHandler.setMixAnimation("grabGlowPants", 0, 0.1)
        GameModel.characterHandler.setIdleAndTurn()
        GameModel.characterHandler.face.setToBase()
        GameModel.clock.addTime()
        this.onComplete()
        GameModel.setUIState(UIState.INVENTORY_DETAIL, Pants.girl)
    }
}

import Transition from "./Transition";
import GameModel, {Pants, StateHighTech, UIState} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindGlowPants extends Transition {

    lock = false;

    set(onComplete: () => void) {
        super.set(onComplete)
        this.lock = false;
        GameModel.textHandler.showHitTrigger("findGlowPants")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setMixAnimation("lookdown", 1.0, 0.5)
    }

    onMouseDown() {
        if (this.lock) return;
        GameModel.gameUI.cursor.animate()

        if (GameModel.textHandler.readNext()) {
            this.lock = true;
            GameModel.characterHandler.setMixAnimation("grabGlowPants", 1, 0.5, this.animationComplete.bind(this))


        }
    }

    animationComplete() {


        GameModel.characterHandler.setMixAnimation("lookdown", 0.0, 0.5)

        GameModel.pantsFound.push(Pants.glow);
        GameModel.gameUI.updateInventory();
        GameModel.sound.playPickPants();
        GameModel.gameUI.cursor.hide()
        GameModel.stateHighTech = StateHighTech.TAKE_HIGHTECH_PANTS;
        GameModel.clock.addTime()
        this.onComplete()
        GameModel.setUIState(UIState.INVENTORY_DETAIL, Pants.glow)
        GameModel.characterHandler.setMixAnimation("grabGlowPants", 0, 0.2, null)


    }
}

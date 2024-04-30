import Transition from "./Transition";
import GameModel, {StateGold} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class TakeKey extends Transition {

    state = 0;

    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("takeKey")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        this.state = 0
    }

    onMouseDown() {
        if (this.state == 1) return
        GameModel.gameUI.cursor.animate()
        if (this.state == 0) {
            if (GameModel.textHandler.readNext()) {
                GameModel.characterHandler.setMixAnimation("grabGlowPants", 1, 0.2, this.animationComplete.bind(this))
                this.state = 1;
                GameModel.gameUI.cursor.hide()
            }
        }
        if (this.state == 2) {
            if (GameModel.textHandler.readNext()) {
                GameModel.gameUI.cursor.hide()
                this.onComplete()
            }
        }
    }

    animationComplete() {
        GameModel.characterHandler.setMixAnimation("grabGlowPants", 0, 0.2);
        GameModel.renderer.modelByLabel["key"].visible = false;
        GameModel.renderer.modelByLabel["key"].enableHitTest = false;
        GameModel.stateGold = StateGold.HAS_KEY;
        GameModel.sound.playPickPants();
        this.state = 2;
        GameModel.textHandler.showHitTrigger("takeKeyDone")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setIdleAndTurn()

    }
}



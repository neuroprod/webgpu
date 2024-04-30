import Transition from "./Transition";
import GameModel, {StateHighTech} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class PickFlower extends Transition {


    public lock = false;

    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("pickFlower")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setMixAnimation("lookdown", 1, 1);
        this.lock = false;
    }

    onMouseDown() {
        if (this.lock) return;
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            GameModel.characterHandler.setMixAnimation("grabHigh", 0.73, 0.54, this.animationComplete.bind(this))
            GameModel.gameUI.cursor.hide()
            this.lock = true;
        }
    }

    animationComplete() {
        GameModel.characterHandler.setMixAnimation("grabHigh", 0, 0.5, this.onDone.bind(this));
        GameModel.stateHighTech = StateHighTech.PICK_FLOWER
        GameModel.sound.playPickPants();

        GameModel.characterHandler.setMixAnimation("lookdown", 0, 1);

    }

    onDone() {
        GameModel.characterHandler.setIdleAndTurn();
        this.onComplete()
    }
}

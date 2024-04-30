import Transition from "./Transition";
import GameModel, {StateGirl} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";


export default class TakeStick extends Transition {

    lock = false;

    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("takeStick")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setMixAnimation("lookdown", 1, 1);
        this.lock = false;
    }

    onMouseDown() {
        if (this.lock) return;
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            this.lock = true;
            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setAnimationOnce("takeStick", 0.5, this.animationComplete.bind(this))


        }
    }

    animationComplete() {
        GameModel.characterHandler.setMixAnimation("lookdown", 0, 1);
        GameModel.renderer.modelByLabel["stick"].visible = false;
        GameModel.renderer.modelByLabel["stick"].enableHitTest = false;
        GameModel.stateGirl = StateGirl.FIND_STICK
        GameModel.sound.playPickPants();
        GameModel.characterHandler.setIdleAndTurn()
        this.onComplete()
    }
}

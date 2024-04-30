import Transition from "./Transition";
import GameModel from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class Sit extends Transition {

    public lock = true;

    set(onComplete: () => void) {
        super.set(onComplete)
        this.lock = true;
        GameModel.characterHandler.setAnimationOnce("sitdown", 0.2, this.onSitDown.bind(this))


    }

    onSitDown() {
        GameModel.characterHandler.sit();
        this.lock = false;
        GameModel.textHandler.showHitTrigger("sitDown")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }

    onMouseDown() {
        if (this.lock) return;
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {
            this.lock = true;
            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setAnimationOnce("standup", 0.2, this.onStandUp.bind(this))
        }
    }

    onStandUp() {
        GameModel.characterHandler.setAnimation("idle")
        this.onComplete()

    }
}

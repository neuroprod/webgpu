import Transition from "./Transition";
import GameModel, {StateHighTech} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class StartMachine extends Transition {

    state = 0;

    set(onComplete: () => void) {
        super.set(onComplete)
        this.state = 0;
        GameModel.characterHandler.setAnimationOnce("typing", 0.5, () => {
            GameModel.stateHighTech = StateHighTech.START_MACHINE;
            GameModel.room.machine.start(true, this.machineDone.bind(this))
            GameModel.characterHandler.setIdleAndTurn(Math.PI / 2 + 0.1)
        })
        GameModel.characterHandler.setMixAnimation("lookdown", 1.0, 0.5)
        GameModel.textHandler.showHitTrigger("startMachine")

        GameModel.gameUI.cursor.show(CURSOR.NEXT)
    }

    machineDone() {
        GameModel.textHandler.showHitTrigger("machineDone")
        this.state = 2;

    }

    onMouseDown() {
        if (this.state == 1) return;
        GameModel.gameUI.cursor.animate()
        if (this.state == 0) {
            if (GameModel.textHandler.readNext()) {
                this.state = 1
                GameModel.gameUI.cursor.hide()
                // GameModel.characterHandler.setIdleAndTurn()

            }
        }
        if (this.state == 2) {
            if (GameModel.textHandler.readNext()) {
                GameModel.characterHandler.setMixAnimation("lookdown", 0.0, 0.5)
                GameModel.characterHandler.setIdleAndTurn()
                GameModel.gameUI.cursor.hide()
                this.onComplete()
            }
        }
    }
}

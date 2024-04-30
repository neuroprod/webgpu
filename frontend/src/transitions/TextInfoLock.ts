import Transition from "./Transition";
import GameModel from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class TextInfoLock extends Transition {

    done = false;

    set(onComplete: () => void, data: string = "") {
        super.set(onComplete)

        this.done = GameModel.textHandler.showHitTrigger(data)
        GameModel.gameUI.cursor.show(CURSOR.NEXT)


    }

    onMouseDown() {

        if (this.done) {
            GameModel.gameUI.cursor.hide()
            this.onComplete()
            return;
        }


        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            GameModel.characterHandler.setIdleAndTurn()
            GameModel.gameUI.cursor.hide()
            this.onComplete()
        }
    }
}

import Transition from "./Transition";
import GameModel from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class TextInfo extends Transition {


    set(onComplete: () => void, data: string = "") {
        super.set(onComplete)

        if (GameModel.textHandler.showHitTrigger(data)) {
            GameModel.gameUI.cursor.show(CURSOR.NEXT)
        } else {
            this.onComplete();
        }


    }

    onMouseDown() {
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            GameModel.characterHandler.setIdleAndTurn()
            GameModel.gameUI.cursor.hide()
            this.onComplete()
        }
    }
}

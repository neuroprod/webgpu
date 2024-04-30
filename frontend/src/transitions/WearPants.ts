import Transition from "./Transition";
import GameModel from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class WearPants extends Transition {
    private lock: boolean;


    set(onComplete: () => void, data = "") {
        super.set(onComplete, data)

        this.lock = true;
        if (data == "") GameModel.characterHandler.setMixAnimation("lookdown", 1, 0.01)
        setTimeout(() => {
            if (data == "") {
                GameModel.textHandler.showHitTrigger("samePants")
                GameModel.characterHandler.setMixAnimation("lookdown", 0, 1)
            } else {
                GameModel.textHandler.showHitTrigger("newPants")

            }

            this.lock = false;
            GameModel.gameUI.cursor.show(CURSOR.NEXT)
        }, 300);
    }

    onMouseDown() {
        if (this.lock) return;
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {
            GameModel.gameUI.cursor.hide();
            this.onComplete()

        }
    }
}

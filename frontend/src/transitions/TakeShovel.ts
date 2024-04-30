import Transition from "./Transition";
import GameModel, {StateGold} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class TakeShovel extends Transition {


    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("takeShovel")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }

    onMouseDown() {
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            GameModel.renderer.modelByLabel["shovel"].visible = false;
            GameModel.renderer.modelByLabel["shovel"].enableHitTest = false;
            GameModel.stateGold = StateGold.GET_SHOVEL;
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()

            this.onComplete()

        }
    }
}

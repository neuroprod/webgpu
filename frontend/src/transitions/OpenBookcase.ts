import Transition from "./Transition";
import GameModel, {StateGold, UIState} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";
import RenderSettings from "../RenderSettings";

export default class OpenBookcase extends Transition {

    state = 0;

    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.characterHandler.setAnimationOnce("crunchDown", 0.2, this.onCrunchDown.bind(this))
        GameModel.renderer.modelByLabel["bookCaseDoorRight"].needsHitTest = false
        GameModel.renderer.modelByLabel["bookCaseDoorLeft"].needsHitTest = false
        this.state = 0;
    }

    onCrunchDown() {
        this.state = 1;

        GameModel.textHandler.showHitTrigger("findNote")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

        let right = GameModel.renderer.modelByLabel["bookCaseDoorRight"]
        let left = GameModel.renderer.modelByLabel["bookCaseDoorLeft"]
        right.setEuler(0, 1.5, 0)
        left.setEuler(0, -1.5, 0)
    }

    onMouseDown() {
        if (this.state == 0) return;
        GameModel.gameUI.cursor.animate()

        if (this.state == 2) {
            this.state = 0;
            RenderSettings.closeMenu();
            GameModel.gameUI.cursor.hide();
            GameModel.gameUI.setUIState(UIState.GAME_DEFAULT, null)
            GameModel.characterHandler.setAnimationOnce("crunchUp", 0.2, () => {
                GameModel.textHandler.showHitTrigger("findNoteEnd")
                GameModel.gameUI.cursor.show(CURSOR.NEXT)
                GameModel.characterHandler.setIdleAndTurn()
                this.state = 4;


            })
        } else if (this.state == 1) {
            if (GameModel.textHandler.readNext()) {

                this.state = 2;
                GameModel.stateGold = StateGold.FIND_NOTE;
                RenderSettings.openMenu()
                GameModel.gameUI.setUIState(UIState.SHOW_NOTE, null)


            }
        } else if (this.state == 4) {
            if (GameModel.textHandler.readNext()) {
                GameModel.gameUI.cursor.hide();
                this.onComplete();
            }
        }
    }
}

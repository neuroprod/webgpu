import Transition from "./Transition";
import GameModel, {Pants, StateHunter, UIState} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindHunterPants extends Transition {

    lock = false;

    set(onComplete: () => void) {
        super.set(onComplete)
        this.lock = false
        GameModel.textHandler.showHitTrigger("findHunter")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }

    onMouseDown() {
        if (this.lock) return;
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            this.lock = true;
            //   GameModel.characterHandler.setMixAnimation("grabGlowPants",1,0.2,this.animationComplete.bind(this))
            GameModel.characterHandler.setAnimationOnce("takeHunter", 0.5, this.animationComplete.bind(this))

        }
    }

    animationComplete() {
        // GameModel.characterHandler.setMixAnimation("grabGlowPants",0,0.2);
        GameModel.renderer.modelByLabel["hunterPants"].visible = false;
        GameModel.renderer.modelByLabel["hunterPants"].enableHitTest = false;
        GameModel.pantsFound.push(Pants.hunter);
        GameModel.gameUI.updateInventory();
        GameModel.sound.playPickPants();
        GameModel.gameUI.cursor.hide()
        GameModel.stateHunter = StateHunter.HAVE_PANTS;
        GameModel.characterHandler.setIdleAndTurn()
        GameModel.clock.addTime()
        this.onComplete()
        GameModel.setUIState(UIState.INVENTORY_DETAIL, Pants.hunter)
    }
}

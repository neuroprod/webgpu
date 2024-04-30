import Transition from "./Transition";
import GameModel, {Pants, StateFasion, UIState} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindFasionPants extends Transition {


    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("findFashionPants")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setMixAnimation("lookdown", 0.7, 1);

    }

    onMouseDown() {
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            GameModel.characterHandler.setMixAnimation("grabHigh", 0.73, 0.57, this.animationComplete.bind(this))

        }
    }

    animationComplete() {
        GameModel.characterHandler.setMixAnimation("grabHigh", 0, 0.5);
        GameModel.outside.mailBox.setState(2);
        GameModel.characterHandler.setMixAnimation("lookdown", 0.0, 0.5);
        GameModel.pantsFound.push(Pants.fashion);
        //if(GameModel.pantsFound.length==3)   GameModel.getDrawingByLabel("chapter2_world").show()
        GameModel.gameUI.updateInventory();
        GameModel.sound.playPickPants();
        GameModel.gameUI.cursor.hide()
        GameModel.stateFashion = StateFasion.TAKE_FASION_PANTS;
        GameModel.clock.addTime()
        this.onComplete()
        GameModel.setUIState(UIState.INVENTORY_DETAIL, Pants.fashion)
    }
}

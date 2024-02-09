import Transition from "./Transition";
import GameModel, {StateGrandpa, UIState} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindGrandpaPants extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("findGrandpaPants")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){




            GameModel.pantsFound.push(3);
            GameModel.gameUI.updateInventory();
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()
            GameModel.stateGrandpa =StateGrandpa.TAKE_GRANDPA_PANTS;
            this.onComplete()
            GameModel.setUIState(UIState.INVENTORY_DETAIL,3)
        }
    }
}

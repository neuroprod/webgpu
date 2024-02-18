import Transition from "./Transition";
import GameModel, {Pants, StateGold, UIState} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class DigGrave extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("digGrave")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.pantsFound.push(Pants.gold);
            GameModel.gameUI.updateInventory();
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()
            GameModel.stateGold =StateGold.GET_GOLD
            this.onComplete()
            GameModel.setUIState(UIState.INVENTORY_DETAIL,Pants.gold)




        }
    }
}

import Transition from "./Transition";
import GameModel, {Pants, StateGirl, UIState} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindGirlpaPants extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("findGirlPants")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){




            GameModel.pantsFound.push(Pants.girl);
            GameModel.gameUI.updateInventory();
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()
            GameModel.stateGirl =StateGirl.TAKE_GIRL_PANTS;
            this.onComplete()
            GameModel.setUIState(UIState.INVENTORY_DETAIL,Pants.girl)
        }
    }
}

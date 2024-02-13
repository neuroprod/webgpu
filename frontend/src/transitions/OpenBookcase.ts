import Transition from "./Transition";
import GameModel, {StateGold} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class OpenBookcase extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("findNote")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){


            GameModel.stateGold =StateGold.FIND_NOTE;

            this.onComplete()

        }
    }
}

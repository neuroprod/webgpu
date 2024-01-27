import Transition from "./Transition";
import GameModel, {MillState, StateGold} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class StartMill extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.characterHandler.startTyping()
        GameModel.textHandler.showHitTrigger("millRun")
        GameModel.setMillState(MillState.ON)
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.stateGold=StateGold.START_MILL
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            GameModel.stateGold =StateGold.START_MILL;
            this.onComplete()
        }
    }
}

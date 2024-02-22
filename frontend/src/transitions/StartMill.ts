import Transition from "./Transition";
import GameModel, {MillState, StateGold} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class StartMill extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.characterHandler.setAnimationOnce("startMill",0.3,()=>{
            GameModel.setMillState(MillState.ON)
           GameModel.characterHandler.setAnimation("idle",0.5);
        })
        GameModel.textHandler.showHitTrigger("millRun")

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

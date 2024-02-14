import Transition from "./Transition";
import GameModel from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class GoGrave extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)

        GameModel.textHandler.showHitTrigger("readCross")
GameModel.characterHandler.setMixAnimation("lookdown",0.75,1)
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            GameModel.characterHandler.setMixAnimation("lookdown",0.0,1)
            this.onComplete()
        }
    }
}

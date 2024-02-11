import Transition from "./Transition";
import GameModel, { StateHighTech} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class StartMachine extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.characterHandler.startTyping()
        GameModel.textHandler.showHitTrigger("startMachine")

        GameModel.gameUI.cursor.show(CURSOR.NEXT)
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            GameModel.stateHighTech=StateHighTech.START_MACHINE;
            this.onComplete()
        }
    }
}

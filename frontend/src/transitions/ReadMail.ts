import Transition from "./Transition";
import GameModel, { StateFasion} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class ReadMail extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.characterHandler.startTyping()
        GameModel.textHandler.showHitTrigger("readMail")
        GameModel.stateFashion =StateFasion.READ_MAIL;
       // GameModel.setLaptopState(LaptopState.NONE)
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            GameModel.stateFashion =StateFasion.READ_MAIL_DONE;
            this.onComplete()
        }
    }
}

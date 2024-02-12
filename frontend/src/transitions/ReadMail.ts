import Transition from "./Transition";
import GameModel, {StateFasion} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class ReadMail extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.characterHandler.startTyping()
       if(GameModel.stateFashion==StateFasion.START) {
           GameModel.textHandler.showHitTrigger("readMail")
           GameModel.stateFashion = StateFasion.READ_MAIL;
       }
        if(GameModel.stateFashion==StateFasion.CAN_READ_MAIL_MAILBOX) {
            GameModel.textHandler.showHitTrigger("readMailAward")
            GameModel.stateFashion = StateFasion.READ_MAIL_MAILBOX;
        }
       // GameModel.setLaptopState(LaptopState.NONE)
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            if(GameModel.stateFashion == StateFasion.READ_MAIL) {
                GameModel.stateFashion = StateFasion.READ_MAIL_DONE;
            }
            if(GameModel.stateFashion == StateFasion.READ_MAIL_MAILBOX) {
                GameModel.stateFashion = StateFasion.GET_FASION_PANTS;
            }
            this.onComplete()
        }
    }
}

import Transition from "./Transition";
import GameModel from "../GameModel";

export default class ReadMail extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.characterHandler.startTyping()
        GameModel.textHandler.showHitTrigger("yougotmail")

    }
    onMouseDown(){
        if(GameModel.textHandler.readNext()){

            GameModel.characterHandler.setIdleAndTurn()
            this.onComplete()
        }
    }
}

import Transition from "./Transition";
import GameModel from "../GameModel";

export default class TextInfo extends Transition{


    set(onComplete: () => void,data:string=""){
        super.set(onComplete)

        GameModel.textHandler.showHitTrigger(data)

    }
    onMouseDown(){
        if(GameModel.textHandler.readNext()){

            GameModel.characterHandler.setIdleAndTurn()

            this.onComplete()
        }
    }
}

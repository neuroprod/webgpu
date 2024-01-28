import Transition from "./Transition";
import GameModel, {LaptopState, StateFasion} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class MakeTriangle extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.characterHandler.startTyping()
        GameModel.textHandler.showHitTrigger("makeTriangle")
        GameModel.setLaptopState(LaptopState.TRIANGLE)
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            GameModel.stateFashion =StateFasion.MAKE_TRIANGLE;
            this.onComplete()
        }
    }
}

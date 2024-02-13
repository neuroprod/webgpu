import Transition from "./Transition";
import GameModel, {StateGold} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class TakeKey extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("takeKey")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.renderer.modelByLabel["key"].visible =false;
            GameModel.renderer.modelByLabel["key"].enableHitTest=false;
            GameModel.stateGold =StateGold.HAS_KEY;
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()

            this.onComplete()

        }
    }
}

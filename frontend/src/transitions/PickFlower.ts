import Transition from "./Transition";
import GameModel, {StateHighTech} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class PickFlower extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("pickFlower")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.stateHighTech =StateHighTech.PICK_FLOWER
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()

            this.onComplete()

        }
    }
}

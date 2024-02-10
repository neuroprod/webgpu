import Transition from "./Transition";
import GameModel, {StateGirl} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class TakeStick extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("takeStick")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.renderer.modelByLabel["stick"].visible =false;
            GameModel.renderer.modelByLabel["stick"].enableHitTest=false;
            GameModel.stateGirl =StateGirl.FIND_STICK
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()

            this.onComplete()

        }
    }
}

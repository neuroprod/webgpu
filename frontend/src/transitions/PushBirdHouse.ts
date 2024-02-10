
import Transition from "./Transition";
import GameModel, {StateGirl} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class PushBirdHouse extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("pushBirdHouse")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.renderer.modelByLabel["girlPants"].visible =true;
            GameModel.renderer.modelByLabel["girlPants"].enableHitTest=true;
            GameModel.stateGirl =StateGirl.PUSH_BIRDHOUSE
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()

            this.onComplete()

        }
    }
}

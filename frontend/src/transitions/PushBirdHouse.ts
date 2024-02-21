
import Transition from "./Transition";
import GameModel, {StateGirl} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class PushBirdHouse extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("pushBirdHouse")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)


    }
    onCompleteAnimation(){

        GameModel.renderer.modelByLabel["stickHold"].visible =false
        GameModel.characterHandler.setIdleAndTurn()

        GameModel.renderer.modelByLabel["girlPants"].visible =true;
        GameModel.renderer.modelByLabel["girlPants"].enableHitTest=true;
        GameModel.stateGirl =StateGirl.PUSH_BIRDHOUSE
        GameModel.sound.playPickPants();
        GameModel.gameUI.cursor.hide()
        GameModel.renderer.modelByLabel["stickHold"].visible =false
        this.onComplete()
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.renderer.modelByLabel["stickHold"].visible =true
            GameModel.characterHandler.setAnimationOnce("birdhouse",0.3,this.onCompleteAnimation.bind(this))


        }
    }
}

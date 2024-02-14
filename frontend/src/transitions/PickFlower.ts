import Transition from "./Transition";
import GameModel, {StateHighTech} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class PickFlower extends Transition{



    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("pickFlower")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setMixAnimation("lookdown", 1, 1);
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.characterHandler.setMixAnimation("grabGlowPants",1,0.5,this.animationComplete.bind(this))


        }
    }
    animationComplete(){
        GameModel.characterHandler.setMixAnimation("grabGlowPants",0,0.5);
        GameModel.stateHighTech =StateHighTech.PICK_FLOWER
        GameModel.sound.playPickPants();
        GameModel.gameUI.cursor.hide()
        GameModel.characterHandler.setMixAnimation("lookdown", 0, 1);
        this.onComplete()
    }
}

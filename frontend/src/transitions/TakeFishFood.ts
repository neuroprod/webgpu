import Transition from "./Transition";
import GameModel, {StateGrandpa} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class TakeFishFood extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)

        GameModel.characterHandler.setAnimationOnce("crunchDown",0.2,this.onCrunchDown.bind(this))


    }
    onCrunchDown(){
        GameModel.textHandler.showHitTrigger("takeFishFood")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.renderer.modelByLabel["fishFood"].visible =false;
            GameModel.renderer.modelByLabel["fishFood"].enableHitTest=false;
            GameModel.stateGrandpa =StateGrandpa.TAKE_FISH_FOOD;
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()

            GameModel.characterHandler.setAnimationOnce("crunchUp",0.2,()=>{

                GameModel.characterHandler.setIdleAndTurn()
                this.onComplete()
            })


        }
    }
}

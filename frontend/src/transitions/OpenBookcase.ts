import Transition from "./Transition";
import GameModel, {StateGold} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class OpenBookcase extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.characterHandler.setAnimationOnce("crunchDown",0.2,this.onCrunchDown.bind(this))



    }
    onCrunchDown(){

        GameModel.textHandler.showHitTrigger("findNote")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

        let right =GameModel.renderer.modelByLabel["bookCaseDoorRight"]
        let left =GameModel.renderer.modelByLabel["bookCaseDoorLeft"]
        right.setEuler(0,1.5,0)
        left.setEuler(0,-1.5,0)
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){


            GameModel.stateGold =StateGold.FIND_NOTE;
            GameModel.characterHandler.setAnimationOnce("crunchUp",0.2,()=>{

                GameModel.characterHandler.setIdleAndTurn()
                this.onComplete()
            })


        }
    }
}

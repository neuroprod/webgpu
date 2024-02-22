import Transition from "./Transition";
import GameModel, {Pants, StateGrandpa, UIState} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindGrandpaPants extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)


        GameModel.textHandler.showHitTrigger("findGrandpaPants")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setMixAnimation("lookdown",1,1)
    }
    onCrunchDown(){
       // GameModel.characterHandler.setIdleAndTurn()
        GameModel.pantsFound.push(Pants.grandpa);
        GameModel.gameUI.updateInventory();
        GameModel.sound.playPickPants();
        GameModel.gameUI.cursor.hide()
        GameModel.characterHandler.setMixAnimation("lookdown",0,0.2)
        GameModel.characterHandler.setMixAnimation("grabGlowPants",0,0.2)
        GameModel.stateGrandpa =StateGrandpa.TAKE_GRANDPA_PANTS;
        this.onComplete()
        GameModel.setUIState(UIState.INVENTORY_DETAIL,Pants.grandpa)
    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){


            GameModel.characterHandler.setAnimationOnce("crunchDown",0.2,this.onCrunchDown.bind(this))

            GameModel.characterHandler.setMixAnimation("grabGlowPants",1,0.5)
        }
    }
}

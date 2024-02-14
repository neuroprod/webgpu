import Transition from "./Transition";
import GameModel, {Pants, StateHunter, UIState} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindHunterPants extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("findHunter")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.characterHandler.setMixAnimation("grabGlowPants",1,0.2,this.animationComplete.bind(this))


        }
    }
    animationComplete(){
        GameModel.characterHandler.setMixAnimation("grabGlowPants",0,0.2);
        GameModel.renderer.modelByLabel["hunterPants"].visible =false;
        GameModel.renderer.modelByLabel["hunterPants"].enableHitTest =false;
        GameModel.pantsFound.push(Pants.hunter);
        GameModel.gameUI.updateInventory();
        GameModel.sound.playPickPants();
        GameModel.gameUI.cursor.hide()
        GameModel.stateHunter =StateHunter.HAVE_PANTS;
        this.onComplete()
        GameModel.setUIState(UIState.INVENTORY_DETAIL,Pants.hunter)
    }
}

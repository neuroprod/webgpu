import Transition from "./Transition";
import GameModel, {Pants, StateHighTech, UIState} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindGlowPants extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("findGlowPants")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){




            GameModel.pantsFound.push(Pants.glow);
            GameModel.gameUI.updateInventory();
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()
            GameModel.stateHighTech =StateHighTech.TAKE_HIGHTECH_PANTS;
            this.onComplete()
            GameModel.setUIState(UIState.INVENTORY_DETAIL,Pants.glow)
        }
    }
}

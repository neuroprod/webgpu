import Transition from "./Transition";
import GameModel, {UIState} from "../GameModel";
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



            GameModel.renderer.modelByLabel["hunterPants"].visible =false;
            GameModel.renderer.modelByLabel["hunterPants"].enableHitTest =false;
            GameModel.pantsFound =1;
            GameModel.gameUI.updateInventory();
            GameModel.sound.playPop();
            GameModel.gameUI.cursor.hide()

            this.onComplete()
            GameModel.setUIState(UIState.INVENTORY_DETAIL,1)
        }
    }
}

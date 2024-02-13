import Transition from "./Transition";
import GameModel, {Pants, StateFasion, StateGirl, UIState} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FindFasionPants extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("findFashionPants")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){


            GameModel.outside.mailBox.setState(2);

            GameModel.pantsFound.push(Pants.fashion);
            GameModel.gameUI.updateInventory();
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()
            GameModel.stateFashion=StateFasion.TAKE_FASION_PANTS;
            this.onComplete()
            GameModel.setUIState(UIState.INVENTORY_DETAIL,Pants.fashion)
        }
    }
}

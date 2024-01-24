import Transition from "./Transition";
import GameModel, {UIState} from "../GameModel";

export default class FindHunterPants extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("findHunter")


    }
    onMouseDown(){
        if(GameModel.textHandler.readNext()){



            GameModel.renderer.modelByLabel["hunterPants"].visible =false;
            GameModel.renderer.modelByLabel["hunterPants"].enableHitTest =false;
            GameModel.pantsFound =1;
            GameModel.gameUI.updateInventory();
            GameModel.sound.playPop();


            this.onComplete()
            GameModel.setUIState(UIState.INVENTORY_DETAIL,1)
        }
    }
}

import Transition from "./Transition";
import GameModel, {StateFasion, StateGirl, StateHighTech} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class Work extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.characterHandler.startTyping()
        if(GameModel.stateFashion ==StateFasion.CAN_MAKE_TRIANGLE){
            GameModel.textHandler.showHitTrigger("makeTriangle")
            GameModel.stateFashion = StateFasion.MAKE_TRIANGLE
            GameModel.gameUI.cursor.show(CURSOR.NEXT)
            GameModel.stateHighTech =StateHighTech.GROW_FLOWER;
            GameModel.stateGirl =StateGirl.BIRD_HOUSE_FELL;

        }  if(GameModel.stateFashion ==StateFasion.CAN_FINISH_WEBSITE){
            GameModel.textHandler.showHitTrigger("makeWebsite")
            GameModel.stateFashion = StateFasion.FINISH_WEBSITE
        }
      //  GameModel.setLaptopState(LaptopState.TRIANGLE)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            if(GameModel.stateFashion ==StateFasion.MAKE_TRIANGLE)
            { GameModel.stateFashion =StateFasion.MAKE_TRIANGLE_DONE;}
            if(GameModel.stateFashion ==StateFasion.FINISH_WEBSITE)
            { GameModel.stateFashion =StateFasion.FINISH_WEBSITE_DONE}
            this.onComplete()
        }
    }
}

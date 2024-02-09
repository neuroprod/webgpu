import Transition from "./Transition";
import GameModel, {StateGrandpa} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FeedFish extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("feedFish")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){



         GameModel.stateGrandpa =StateGrandpa.FEED_FISH;
            this.onComplete()

        }
    }
}

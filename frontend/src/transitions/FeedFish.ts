import Transition from "./Transition";
import GameModel, {StateGrandpa} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FeedFish extends Transition {

    clickState = 0;

    set(onComplete: () => void) {
        super.set(onComplete)
        this.clickState = 0
        GameModel.textHandler.showHitTrigger("feedFish")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }

    onMouseDown() {
        if (this.clickState == 0) {
            GameModel.gameUI.cursor.animate()
            if (GameModel.textHandler.readNext()) {
                this.clickState = 1
                GameModel.gameUI.cursor.hide();
                GameModel.renderer.modelByLabel["fishFoodHold"].visible = true
                GameModel.characterHandler.setAnimationOnce('feedFish', 0.2, this.feedComplete.bind(this))

            }
        }
        if (this.clickState == 2) {
            GameModel.gameUI.cursor.animate()
            if (GameModel.textHandler.readNext()) {
                GameModel.gameUI.cursor.hide();
                this.onComplete()

            }
        }
    }

    feedComplete() {
        GameModel.characterHandler.setIdleAndTurn()
        GameModel.stateGrandpa = StateGrandpa.FEED_FISH;
        GameModel.renderer.modelByLabel["fishFoodHold"].visible = false
        this.clickState = 2
        GameModel.textHandler.showHitTrigger("fishFoodDone")
            GameModel.gameUI.cursor.show(CURSOR.NEXT)
        this.onComplete()
    }
}

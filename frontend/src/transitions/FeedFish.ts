import Transition from "./Transition";
import GameModel, {StateGrandpa} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FeedFish extends Transition {

    clickState = 0;

    set(onComplete: () => void) {
        super.set(onComplete)
        this.clickState = 0
        GameModel.textHandler.showHitTrigger("feedFish")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.setMixAnimation('lookdown', 0.5, 0.5, () => {
        })
        GameModel.characterHandler.face.lookDown()
    }

    onMouseDown() {
        if (this.clickState == 0) {
            GameModel.gameUI.cursor.animate()
            if (GameModel.textHandler.readNext()) {
                this.clickState = 1
                GameModel.gameUI.cursor.hide();
                GameModel.characterHandler.setMixAnimation('lookdown', 0, 0.5, () => {
                })
                setTimeout(() => {
                    GameModel.renderer.modelByLabel["fishFoodHold"].visible = true
                }, 300);
                GameModel.characterHandler.setAnimationOnce('feedFish', 0.2, this.feedComplete.bind(this))
                setTimeout(() => {
                    GameModel.sound.playFishFood()
                }, 900)
                setTimeout(() => {
                    GameModel.sound.playFishFood()
                }, 1.15 * 1000)
            }
            setTimeout(() => {
                GameModel.sound.playFishFood()
            }, 1.6 * 1000)
        }
        if (this.clickState == 2) {
            GameModel.gameUI.cursor.animate()
            if (GameModel.textHandler.readNext()) {
                GameModel.gameUI.cursor.hide();
                this.clickState = 3;
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
        GameModel.characterHandler.face.setToBase()
        GameModel.characterHandler.face.isRandom = true;


    }
}

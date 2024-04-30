import Transition from "./Transition";
import GameModel, {StateGrandpa} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class TakeFishFood extends Transition {

    lockMouse = false

    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("takeFishFood")
        GameModel.characterHandler.setMixAnimation('lookdown', 1, 0.5, () => {
        })
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

    }

    onCrunchDown() {

        GameModel.stateGrandpa = StateGrandpa.TAKE_FISH_FOOD;
        GameModel.sound.playPickPants();
        GameModel.renderer.modelByLabel["fishFoodHold"].visible = false
        this.lockMouse = false;
        GameModel.characterHandler.setIdleAndTurn()
        this.onComplete()
    }

    onMouseDown() {
        if (this.lockMouse) return;
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {
            this.lockMouse = true

            GameModel.characterHandler.setMixAnimation('lookdown', 0, 0.5, () => {
            })
            GameModel.characterHandler.setAnimationOnce("takeFood", 0.5, this.onCrunchDown.bind(this))
            GameModel.gameUI.cursor.hide()
            setTimeout(() => {
                GameModel.renderer.modelByLabel["fishFoodHold"].visible = true
                GameModel.renderer.modelByLabel["fishFood"].visible = false;
                GameModel.renderer.modelByLabel["fishFood"].enableHitTest = false;
            }, 666);


            /* GameModel.renderer.modelByLabel["fishFood"].visible =false;
             GameModel.renderer.modelByLabel["fishFood"].enableHitTest=false;
             GameModel.stateGrandpa =StateGrandpa.TAKE_FISH_FOOD;
             GameModel.sound.playPickPants();
             GameModel.gameUI.cursor.hide()

             GameModel.characterHandler.setAnimationOnce("crunchUp",0.2,()=>{


                 GameModel.characterHandler.setIdleAndTurn()
                 this.onComplete()
             })*/


        }
    }
}

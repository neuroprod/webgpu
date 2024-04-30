import Transition from "./Transition";
import GameModel, {Scenes} from "../../public/GameModel";
import Timeline from "gsap";
import RenderSettings from "../RenderSettings";
import {CURSOR} from "../ui/Cursor";

export default class StartGame extends Transition {
    private start: boolean = false;
    private nextText: boolean = false;

    set(onComplete: () => void) {
        this.onComplete = onComplete
        GameModel.textHandler.showHitTrigger("intro")

        GameModel.gameUI.cursor.show(CURSOR.NEXT)


    }

    onMouseDown() {


        GameModel.gameUI.cursor.animate()

        if (this.nextText) {
            if (GameModel.textHandler.readNext()) {
                GameModel.gameUI.cursor.hide()
                this.onComplete()
            }

            return
        }
        if (GameModel.textHandler.readNext()) {
            if (this.start) return;
            this.start = true;
            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            GameModel.sound.startMusic();
            RenderSettings.fadeToBlack(1.5)
            let ts = Timeline.timeline({})


            ts.call(() => {
                if (GameModel.startOutside) {
                    GameModel.setScene(Scenes.OUTSIDE)

                    GameModel.characterPos.set(-22, 0, -1);
                } else {
                    GameModel.setScene(Scenes.ROOM)
                    GameModel.roomCamOffset = 1;
                    GameModel.characterPos.set(2, 0, -1);
                }

                GameModel.characterHandler.setMixAnimation("coffee", 0, 0.0)
                RenderSettings.fadeToScreen(3)
            }, [], 2)
            ts.call(() => {
                //GameModel.setUIState(UIState.GAME_DEFAULT)
                this.nextText = true;
                GameModel.gameUI.cursor.show(CURSOR.NEXT)
                GameModel.textHandler.showHitTrigger("introMail")
            }, [], 5)


        }
    }
}

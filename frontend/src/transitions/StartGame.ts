import Transition from "./Transition";
import GameModel, {Scenes, UIState} from "../GameModel";
import Timeline from "gsap";
import RenderSettings from "../RenderSettings";
import {CURSOR} from "../ui/Cursor";

export default class StartGame extends Transition {
    private start: boolean=false ;
    set(onComplete: () => void) {
        this.onComplete =onComplete
        GameModel.textHandler.showHitTrigger("radio")

        GameModel.gameUI.cursor.show(CURSOR.NEXT)



    }
    onMouseDown(){
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){
            if(this.start)return;
            this.start =true;
            GameModel.gameUI.cursor.hide()
            GameModel.characterHandler.setIdleAndTurn()
            GameModel.sound.startMusic();
            RenderSettings.fadeToBlack(1.5)
            let ts = Timeline.timeline({onComplete: this.onComplete})



            ts.call(() => {
                if (GameModel.startOutside) {
                    GameModel.setScene(Scenes.OUTSIDE)

                    GameModel.characterPos.set(-5, 0, -1);
                } else {
                    GameModel.setScene(Scenes.ROOM)
                    GameModel.roomCamOffset = 1;
                    GameModel.characterPos.set(2, 0, -1);
                }

                RenderSettings.fadeToScreen(3)
            }, [], 2)
            ts.call(() => {
                GameModel.setUIState(UIState.GAME_DEFAULT)

            }, [], 4)
        }
    }
}

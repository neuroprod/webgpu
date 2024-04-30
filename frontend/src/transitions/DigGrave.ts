import Transition from "./Transition";
import GameModel, {Scenes, StateGold, UIState} from "../../public/GameModel";
import RenderSettings from "../RenderSettings";
import {CURSOR} from "../ui/Cursor";

export default class DigGrave extends Transition {

    state = 1;

    set(onComplete: () => void) {
        super.set(onComplete)
        this.state = 1;
        GameModel.textHandler.showHitTrigger("digGrave")
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        GameModel.characterHandler.face.lookDown()

    }

    onMouseDown() {
        if (this.state == 0) return
        GameModel.gameUI.cursor.animate();
        if (this.state == 1) {
            if (GameModel.textHandler.readNext()) {
                this.state = 0;
                GameModel.gameUI.cursor.hide()
                this.shovelAnime();
            }
        }
        if (this.state == 2) {
            if (GameModel.textHandler.readNext()) {
                this.state = 0;
                GameModel.gameUI.cursor.hide()
                RenderSettings.fadeToBlack(1, 0);
                setTimeout(() => {
                    this.outroAnime()
                }, 1000);
            }
        }
    }

    shovelAnime() {
        GameModel.renderer.modelByLabel["shovelHold"].visible = true
        GameModel.characterHandler.setAnimation("digging", 0.3);
        setTimeout(() => {
            GameModel.sound.playShovel()
        }, 700)

        RenderSettings.fadeToBlack(1, 2)
        setTimeout(() => {
            RenderSettings.dof_Settings.z = 1;
            RenderSettings.onChange()
            this.pantsAnime();
        }, 5000);
    }

    pantsAnime() {
        GameModel.stateGold = StateGold.GET_GOLD
        RenderSettings.fadeToScreen(1)
        GameModel.renderer.modelByLabel["shovelHold"].visible = false
        GameModel.renderer.modelByLabel["skeleton"].visible = true
        GameModel.renderer.modelByLabel["skeletonPants"].visible = true
        GameModel.characterHandler.face.lookGold();
        GameModel.characterHandler.setAnimationOnce("goldPants", 0, () => {
            GameModel.outside.particlesGold.show(0.0);
            GameModel.textHandler.showHitTrigger("digGraveDone", true, -1)
            GameModel.gameUI.cursor.show(CURSOR.NEXT)
            this.state = 2

        });
    }

    outroAnime() {
        GameModel.characterHandler.face.setToBase()
        GameModel.stateGold = StateGold.OUTRO;
        GameModel.characterHandler.setPants(6)
        GameModel.characterHandler.setIdleAndTurn()
        GameModel.renderer.modelByLabel["coffee"].visible = false;
        GameModel.setScene(Scenes.PRELOAD)
        RenderSettings.fadeToScreen(1)
        GameModel.setUIState(UIState.END_SCREEN);
    }
}

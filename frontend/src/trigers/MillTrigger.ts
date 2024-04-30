import HitTrigger from "./HitTrigger";
import GameModel, {StateGold, Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class MillTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        if (GameModel.stateGold == StateGold.START) {
            GameModel.setTransition(Transitions.TEXT_INFO, "millStart")
            return;
        }
        if (GameModel.stateGold == StateGold.START_MILL) {
            GameModel.setTransition(Transitions.TEXT_INFO, "millWait")
            return;
        }


        let obj = GameModel.renderer.modelByLabel["mill"]
        let world = obj.getWorldPos()
        world.z += 1.0;
        world.x += 0.1;
        GameModel.hitObjectLabel = ""
        GameModel.gameUI.cursor.hide()
        GameModel.characterHandler.walkTo(world, Math.PI, this.onCompleteWalk);
    }

    onCompleteWalk() {

        if (GameModel.stateGold == StateGold.LOCKED_DOOR) {

            GameModel.setTransition(Transitions.START_MILL)
            return;
        }


        // GameModel.setTransition(Transitions.READ_MAIL)
        /* GameModel.setGameState(GameState.READ_MAIL)
         GameModel.textHandler.showHitTrigger("yougotmail")*/
        // GameModel.characterHandler.startTyping()

        // GameModel.setScene(Scenes.OUTSIDE)
        //let door = GameModel.renderer.modelByLabel["door"]
        //GameModel.characterPos = door.getWorldPos()
    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["mill"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }
}

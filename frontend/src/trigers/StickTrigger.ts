import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class StickTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        let obj = GameModel.renderer.modelByLabel["stick"]
        let world = obj.getWorldPos()
        world.z += 1.5;
        GameModel.hitObjectLabel = ""
        GameModel.characterHandler.walkTo(world, Math.PI, this.onCompleteWalk)
    }

    onCompleteWalk() {

        GameModel.setTransition(Transitions.TAKE_STICK)

        // GameModel.setGameState(GameState.FIND_HUNTER)
        // GameModel.textHandler.showHitTrigger("findHunter")


    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["stick"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }
}

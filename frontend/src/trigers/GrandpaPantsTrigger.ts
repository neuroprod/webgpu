import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class GrandpaPantsTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        let obj = GameModel.renderer.modelByLabel["grandpaPants"]
        let world = obj.getWorldPos()
        world.z -= 0.7;
        GameModel.hitObjectLabel = ""
        GameModel.characterHandler.walkTo(world, 0, this.onCompleteWalk)
    }

    onCompleteWalk() {

        GameModel.setTransition(Transitions.FIND_GRANDPA_PANTS)

        // GameModel.setGameState(GameState.FIND_HUNTER)
        // GameModel.textHandler.showHitTrigger("findHunter")


    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["grandpaPants"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }
}

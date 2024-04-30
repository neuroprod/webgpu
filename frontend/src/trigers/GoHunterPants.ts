import HitTrigger from "./HitTrigger";
import GameModel, {StateGrandpa, Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class GoHunterTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        if (GameModel.stateGrandpa == StateGrandpa.FEED_FISH) {
            GameModel.stateGrandpa = StateGrandpa.SHOW_GRANDPA_PANTS;
        }
        let obj = GameModel.renderer.modelByLabel["hunterPants"]
        let world = obj.getWorldPos()
        world.z += 1.5;
        GameModel.characterHandler.walkTo(world, Math.PI, this.onCompleteWalk)
        GameModel.hitObjectLabel = ""
    }

    onCompleteWalk() {

        GameModel.setTransition(Transitions.FIND_HUNTER_PANTS)

        // GameModel.setGameState(GameState.FIND_HUNTER)
        // GameModel.textHandler.showHitTrigger("findHunter")


    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["hunterPants"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }
}

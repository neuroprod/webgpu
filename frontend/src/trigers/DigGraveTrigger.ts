import HitTrigger from "./HitTrigger";
import GameModel, {StateGold, Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class DigGraveTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        if (GameModel.stateGold == StateGold.FIND_NOTE) {
            GameModel.setTransition(Transitions.TEXT_INFO, "diggHand")
        } else {
            let obj = GameModel.renderer.modelByLabel["cross"]
            let world = obj.getWorldPos()
            world.z -= 1.0;
            world.x += 0.6;
            GameModel.hitObjectLabel = ""
            GameModel.characterHandler.walkTo(world, -0.2, this.onCompleteWalk)
            GameModel.outlinePass.setModel(null);
        }
    }

    onCompleteWalk() {
        GameModel.setTransition(Transitions.DIG_GRAVE)


    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["grave"]);
        if (GameModel.stateGold == StateGold.FIND_NOTE) {

            GameModel.gameUI.cursor.show(CURSOR.LOOK)
        } else {
            GameModel.gameUI.cursor.show(CURSOR.DIG)
        }

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }
}

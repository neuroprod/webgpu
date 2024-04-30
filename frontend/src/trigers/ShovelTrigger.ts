import HitTrigger from "./HitTrigger";
import GameModel, {StateGold, Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class ShovelTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        if (GameModel.stateGold == StateGold.FIND_NOTE) {
            let pot = GameModel.renderer.modelByLabel["shovel"]
            let world = pot.getWorldPos(new Vector3(-0.7, 0, 0.5))
            GameModel.characterHandler.walkTo(world, 2, this.onCompleteWalk, false)
            GameModel.hitObjectLabel = ""
            // GameModel.getDrawingByLabel("chapter5_world").show()
        } else {
            GameModel.setTransition(Transitions.TEXT_INFO, "shovelNoNeed")
        }


        return;
    }

    onCompleteWalk() {

        GameModel.setTransition(Transitions.TAKE_SHOVEL)

    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["shovel"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }
}

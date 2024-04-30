import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class FlowerHitTrigger extends HitTrigger {


    protected click() {
        GameModel.sound.playClick(0.2)
        let pot = GameModel.renderer.modelByLabel["pot"]
        let world = pot.getWorldPos(new Vector3(-0.7 - 0.07, 0, 0.5))
        GameModel.characterHandler.walkTo(world, 2 + 0.12, this.onCompleteWalk, false)
        GameModel.hitObjectLabel = ""
    }

    onCompleteWalk() {
        GameModel.setTransition(Transitions.PICK_FLOWER);

    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["glowFlower"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }


}

import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class FishFoodTrigger extends HitTrigger {

    protected click() {

        GameModel.sound.playClick(0.2)
        let pot = GameModel.renderer.modelByLabel["fishFood"]
        let world = pot.getWorldPos(new Vector3(-0.15, 0, -0.4))
        GameModel.characterHandler.walkTo(world, -Math.PI + 0.3, this.onCompleteWalk, false)
        GameModel.hitObjectLabel = ""


        return;
    }

    onCompleteWalk() {

        GameModel.setTransition(Transitions.TAKE_FISH_FOOD)
    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["fishFood"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }
}

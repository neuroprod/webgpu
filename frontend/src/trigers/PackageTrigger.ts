import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class PackageTrigger extends HitTrigger {


    protected click() {
        GameModel.sound.playClick(0.2)
        let pot = GameModel.renderer.modelByLabel["package"]
        let world = pot.getWorldPos(new Vector3(-1.5, 0, 0.5))
        GameModel.characterHandler.walkTo(world, 2, this.onCompleteWalk, false)
        GameModel.hitObjectLabel = ""
    }

    onCompleteWalk() {
        GameModel.setTransition(Transitions.TAKE_PACKAGE);

    }

    public over() {

        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["package"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }


}

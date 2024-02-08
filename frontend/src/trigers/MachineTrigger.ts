import HitTrigger from "./HitTrigger";
import GameModel, {StateHighTech, Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class MachineHitTrigger extends HitTrigger {




    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["coffeeMaker"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }

    protected click() {
        if (GameModel.stateHighTech == StateHighTech.START || GameModel.stateHighTech == StateHighTech.GROW_FLOWER) {
            GameModel.setTransition(Transitions.TEXT_INFO, "missingIngredient")

            return;
        }
        if (GameModel.stateHighTech == StateHighTech.PICK_FLOWER) {
            let pot = GameModel.renderer.modelByLabel["table"]
            let world = pot.getWorldPos(new Vector3(-0.5, 0, 0))
            GameModel.characterHandler.walkTo(world, Math.PI/2, this.onCompleteWalk, false)
        }
    }
    onCompleteWalk() {
        GameModel.setTransition(Transitions.START_MACHINE);

    }

}

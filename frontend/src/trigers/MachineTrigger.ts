import HitTrigger from "./HitTrigger";
import GameModel, {StateHighTech, Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class MachineHitTrigger extends HitTrigger {


    public over() {
        if (GameModel.stateHighTech == StateHighTech.STOP_MACHINE || GameModel.stateHighTech == StateHighTech.TAKE_HIGHTECH_PANTS) return
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["coffeeMaker"]);


        if (GameModel.stateHighTech == StateHighTech.PICK_FLOWER) {
            GameModel.gameUI.cursor.show(CURSOR.FLOWER)
        } else {
            GameModel.gameUI.cursor.show(CURSOR.LOOK)

        }


    }

    public out() {
        if (GameModel.stateHighTech == StateHighTech.STOP_MACHINE || GameModel.stateHighTech == StateHighTech.TAKE_HIGHTECH_PANTS) return
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }

    protected click() {
        GameModel.sound.playClick(0.2)
        if (GameModel.stateHighTech == StateHighTech.STOP_MACHINE || GameModel.stateHighTech == StateHighTech.TAKE_HIGHTECH_PANTS) return
        if (GameModel.stateHighTech == StateHighTech.START || GameModel.stateHighTech == StateHighTech.GROW_FLOWER) {
            GameModel.setTransition(Transitions.TEXT_INFO, "missingIngredient")

            return;
        }
        if (GameModel.stateHighTech == StateHighTech.START_MACHINE) {
            GameModel.setTransition(Transitions.TEXT_INFO, "hightechDoneSoon")

            return;
        }
        if (GameModel.stateHighTech == StateHighTech.PICK_FLOWER) {
            let pot = GameModel.renderer.modelByLabel["table"]
            let world = pot.getWorldPos(new Vector3(-0.7, 0, 0))
            GameModel.characterHandler.walkTo(world, Math.PI / 2, this.onCompleteWalk, false)
            GameModel.hitObjectLabel = ""
        }
    }

    onCompleteWalk() {
        GameModel.setTransition(Transitions.START_MACHINE);

    }

}

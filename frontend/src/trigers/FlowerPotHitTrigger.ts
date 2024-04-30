import HitTrigger from "./HitTrigger";
import GameModel, {StateHighTech, Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class FlowerPotHitTrigger extends HitTrigger {


    protected click() {
        GameModel.sound.playClick(0.2)
        if (GameModel.stateHighTech == StateHighTech.START) {
            GameModel.setTransition(Transitions.TEXT_INFO, "flowerPreBloom")

            return;
        }

    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["pot"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }


}

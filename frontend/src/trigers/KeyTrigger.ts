import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class KeyTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        let obj = GameModel.renderer.modelByLabel["key"]
        let world = obj.getWorldPos()
        world.z += 1.0;
        world.x += 0.1;
        GameModel.gameUI.cursor.hide()
        GameModel.characterHandler.walkTo(world, Math.PI + 0.1, this.onCompleteWalk)
    }

    onCompleteWalk() {


        GameModel.setTransition(Transitions.TAKE_KEY)

    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["key"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }
}

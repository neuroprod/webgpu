import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class GoGraveTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        let obj = GameModel.renderer.modelByLabel["cross"]
        let world = obj.getWorldPos()
        world.z -= 1.5;
        world.x += 1;
        GameModel.characterHandler.walkTo(world, -0.5, this.onCompleteWalk)
        GameModel.outlinePass.setModel(null);
        GameModel.hitObjectLabel = ""
    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["cross"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }

    onCompleteWalk() {

        GameModel.setTransition(Transitions.GO_GRAVE)


        /// GameModel.textHandler.showHitTrigger("readCross")


    }
}

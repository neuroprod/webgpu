import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class SitTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        // if(GameModel.gameState!=GameState.START)return;
        let obj = GameModel.renderer.modelByLabel["chair"]
        let world = obj.getWorldPos()
        world.z += 0.6;
        world.x += 0.3;
        GameModel.hitObjectLabel = ""
        GameModel.characterHandler.walkTo(world, 0.5, this.onCompleteWalk)
    }

    onCompleteWalk() {

        GameModel.setTransition(Transitions.SIT)
        // GameModel.characterHandler.sit()

        // GameModel.setScene(Scenes.OUTSIDE)
        //let door = GameModel.renderer.modelByLabel["door"]
        //GameModel.characterPos = door.getWorldPos()
    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["chair"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }
}

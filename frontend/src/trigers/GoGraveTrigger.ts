import HitTrigger from "./HitTrigger";
import GameModel, {GameState} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class GoGraveTrigger extends HitTrigger{

    protected click() {

        let obj = GameModel.renderer.modelByLabel["cross"]
        let world = obj.getWorldPos()
        world.z-=1.0;
        GameModel.characterHandler.walkTo(world,0,this.onCompleteWalk)
        GameModel.outlinePass.setModel(null);
    }
    public over() {

        GameModel.gameUI.cursor.show(CURSOR.LOOK)
        GameModel.outlinePass.setModel(null);
    }

    public out() {
        GameModel.gameUI.cursor.hide()
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["cross"]);
    }

    onCompleteWalk(){



        GameModel.setGameState(GameState.READ_CROSS)
        GameModel.textHandler.showHitTrigger("readCross")


    }
}

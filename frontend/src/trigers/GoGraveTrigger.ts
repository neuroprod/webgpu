import HitTrigger from "./HitTrigger";
import GameModel, {GameState} from "../GameModel";

export default class GoGraveTrigger extends HitTrigger{

    protected click() {

        let obj = GameModel.renderer.modelByLabel["cross"]
        let world = obj.getWorldPos()
        world.z-=1.0;
        GameModel.characterHandler.walkTo(world,0,this.onCompleteWalk)
    }
    onCompleteWalk(){



        GameModel.setGameState(GameState.READ_CROSS)
        GameModel.textHandler.showHitTrigger("readCross")


    }
}

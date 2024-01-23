import HitTrigger from "./HitTrigger";
import GameModel, {GameState} from "../GameModel";

export default class SitTrigger extends HitTrigger{

    protected click() {
        // if(GameModel.gameState!=GameState.START)return;
        let obj = GameModel.renderer.modelByLabel["chair"]
        let world = obj.getWorldPos()
        world.z+=0.6;
        world.x+=0.3;
        GameModel.characterHandler.walkTo(world,0.5,this.onCompleteWalk)
    }
    onCompleteWalk(){


        GameModel.characterHandler.sit()

        // GameModel.setScene(Scenes.OUTSIDE)
        //let door = GameModel.renderer.modelByLabel["door"]
        //GameModel.characterPos = door.getWorldPos()
    }
}

import HitTrigger from "./HitTrigger";
import GameModel, {GameState} from "../GameModel";

export default class GoWorkTrigger extends HitTrigger{

    protected click() {
        if(GameModel.gameState!=GameState.START)return;
        let obj = GameModel.renderer.modelByLabel["labtop"]
        let world = obj.getWorldPos()
        world.z+=1.0;
        GameModel.characterHandler.walkTo(world,Math.PI,this.onCompleteWalk)
    }
    onCompleteWalk(){

        GameModel.setGameState(GameState.READ_MAIL)
        GameModel.textHandler.showHitTrigger("yougotmail")


        // GameModel.setScene(Scenes.OUTSIDE)
        //let door = GameModel.renderer.modelByLabel["door"]
        //GameModel.characterPos = door.getWorldPos()
    }
}

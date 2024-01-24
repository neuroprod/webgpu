import HitTrigger from "./HitTrigger";
import GameModel, {GameState, Transitions} from "../GameModel";

export default class GoWorkTrigger extends HitTrigger{

    protected click() {
       // if(GameModel.gameState!=GameState.START)return;
        let obj = GameModel.renderer.modelByLabel["labtop"]
        let world = obj.getWorldPos()
        world.z+=1.0;
        world.x+=0.1;
        GameModel.characterHandler.walkTo(world,Math.PI+0.1,this.onCompleteWalk)
    }
    onCompleteWalk(){
GameModel.setTransition(Transitions.READ_MAIL)
       /* GameModel.setGameState(GameState.READ_MAIL)
        GameModel.textHandler.showHitTrigger("yougotmail")*/
       // GameModel.characterHandler.startTyping()

        // GameModel.setScene(Scenes.OUTSIDE)
        //let door = GameModel.renderer.modelByLabel["door"]
        //GameModel.characterPos = door.getWorldPos()
    }
}

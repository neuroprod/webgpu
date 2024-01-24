import HitTrigger from "./HitTrigger";
import GameModel, {GameState, Transitions} from "../GameModel";

export default class GoHunterTrigger extends HitTrigger{

    protected click() {

        let obj = GameModel.renderer.modelByLabel["hunterPants"]
        let world = obj.getWorldPos()
        world.z+=1.5;
        GameModel.characterHandler.walkTo(world,Math.PI,this.onCompleteWalk)
    }
    onCompleteWalk(){

        GameModel.setTransition(Transitions.FIND_HUNTER_PANTS)

       // GameModel.setGameState(GameState.FIND_HUNTER)
       // GameModel.textHandler.showHitTrigger("findHunter")


    }
}

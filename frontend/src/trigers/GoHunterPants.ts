import HitTrigger from "./HitTrigger";
import GameModel, { Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

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
    public over() {
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["hunterPants"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel( null);
        GameModel.gameUI.cursor.hide()

    }
}

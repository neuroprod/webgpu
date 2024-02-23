import HitTrigger from "./HitTrigger";
import GameModel, { Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class GirlPantsTrigger extends HitTrigger{

    protected click() {

        let obj = GameModel.renderer.modelByLabel["girlPants"]
        let world = obj.getWorldPos()
        world.x-=0.5;
        GameModel.characterHandler.walkTo(world,Math.PI/2,this.onCompleteWalk)
        GameModel.hitObjectLabel=""
        return;
    }
    onCompleteWalk(){

        GameModel.setTransition(Transitions.FIND_GIRL_PANTS)
    }
    public over() {
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["girlPants"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel( null);
        GameModel.gameUI.cursor.hide()

    }
}

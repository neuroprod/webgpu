import HitTrigger from "./HitTrigger";
import GameModel, {StateGrandpa, Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class FishFoodTrigger extends HitTrigger{

    protected click() {


            let pot = GameModel.renderer.modelByLabel["fishFood"]
            let world = pot.getWorldPos(new Vector3(0,0,-1.0))
            GameModel.characterHandler.walkTo(world,-Math.PI,this.onCompleteWalk,false)



            return;
    }
    onCompleteWalk(){

        GameModel.setTransition(Transitions.TAKE_FISH_FOOD)
    }
    public over() {
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["fishFood"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel( null);
        GameModel.gameUI.cursor.hide()

    }
}

import HitTrigger from "./HitTrigger";
import GameModel, {StateGold, Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class ShovelTrigger extends HitTrigger{

    protected click() {
        if(GameModel.stateGold==StateGold.FIND_NOTE){
            let pot = GameModel.renderer.modelByLabel["shovel"]
            let world = pot.getWorldPos(new Vector3(-0.7,0,0.5))
            GameModel.characterHandler.walkTo(world,2,this.onCompleteWalk,false)
            GameModel.hitObjectLabel=""
        }else{
            GameModel.setTransition(Transitions.TEXT_INFO,"shovelNoNeed")
        }



        return;
    }
    onCompleteWalk(){

        GameModel.setTransition(Transitions.TAKE_SHOVEL)

    }
    public over() {
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["shovel"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel( null);
        GameModel.gameUI.cursor.hide()

    }
}

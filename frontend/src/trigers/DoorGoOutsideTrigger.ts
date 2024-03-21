import HitTrigger from "./HitTrigger";
import GameModel, {StateGrandpa, Transitions} from "../GameModel";
import {Vector3} from "math.gl";
import {CURSOR} from "../ui/Cursor";

export default class DoorGoOutsideTrigger extends HitTrigger{

    protected click() {
        if(GameModel.stateGrandpa==StateGrandpa.FEED_FISH){
            GameModel.stateGrandpa =StateGrandpa.SHOW_GRANDPA_PANTS;
        }
        let doorOutside = GameModel.renderer.modelByLabel["door_HO"]
        let world = doorOutside.getWorldPos(new Vector3(1,0,0))
        GameModel.characterHandler.walkTo(world,0,this.onCompleteWalk,true)
        GameModel.hitObjectLabel=""
    }
    onCompleteWalk(){
        GameModel.setTransition(Transitions.GO_OUTSIDE);
        let doorOutside = GameModel.renderer.modelByLabel["door_HO"]
        let world = doorOutside.getWorldPos(new Vector3(0.5,0,0))
        GameModel.characterHandler.walkTo(world,0,()=>{},false)
    }
    protected over() {
        //UI.logEvent("Over", this.objectLabel);

        GameModel.gameUI.cursor.show(CURSOR.ARROW_LEFT)
    }

    protected out() {
        //  UI.logEvent("Out", this.objectLabel);
        GameModel.gameUI.cursor.hide()
    }
}

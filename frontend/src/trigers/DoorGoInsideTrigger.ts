import HitTrigger from "./HitTrigger";
import GameModel, {Scenes, Transitions} from "../GameModel";
import {Vector3} from "math.gl";
import {CURSOR} from "../ui/Cursor";

export default class DoorGoInsideTrigger extends HitTrigger{

    protected click() {
        let door = GameModel.renderer.modelByLabel["door"]
        let world = door.getWorldPos(new Vector3(0,0,1))
        GameModel.characterHandler.walkTo(world,0,this.onCompleteWalk,true)
        GameModel.hitObjectLabel=""
    }
    onCompleteWalk(){
        GameModel.setTransition(Transitions.GO_INSIDE)
        let door = GameModel.renderer.modelByLabel["door"]
        let world = door.getWorldPos(new Vector3(0,0,0.5))
        GameModel.characterHandler.walkTo(world,0,()=>{},false)
    }
    protected over() {
        //UI.logEvent("Over", this.objectLabel);

        GameModel.gameUI.cursor.show(CURSOR.ARROW_RIGHT)
    }

    protected out() {
        //  UI.logEvent("Out", this.objectLabel);
        GameModel.gameUI.cursor.hide()
    }
}

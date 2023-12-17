import HitTrigger from "./HitTrigger";
import GameModel, {Scenes, Transitions} from "../GameModel";
import {Vector3} from "math.gl";

export default class DoorGoInsideTrigger extends HitTrigger{

    protected click() {
        let door = GameModel.renderer.modelByLabel["door"]
        let world = door.getWorldPos(new Vector3(0,0,0.5))
        GameModel.characterHandler.walkTo(world,new Vector3(-1,0,0).add(world),this.onCompleteWalk,true)
    }
    onCompleteWalk(){
        GameModel.setTransition(Transitions.GO_INSIDE)
        //let door = GameModel.renderer.modelByLabel["door_HO"]
       // GameModel.characterPos = door.getWorldPos()
    }
}

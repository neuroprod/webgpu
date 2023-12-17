import HitTrigger from "./HitTrigger";
import GameModel, {Scenes, Transitions} from "../GameModel";
import {Vector3} from "math.gl";

export default class DoorGoOutsideTrigger extends HitTrigger{

    protected click() {
        let doorOutside = GameModel.renderer.modelByLabel["door_HO"]
        let world = doorOutside.getWorldPos(new Vector3(0.5,0,0))
        GameModel.characterHandler.walkTo(world,0,this.onCompleteWalk,true)
    }
    onCompleteWalk(){
        GameModel.setTransition(Transitions.GO_OUTSIDE);
        //GameModel.setScene(Scenes.OUTSIDE)
      //  let door = GameModel.renderer.modelByLabel["door"]
       // GameModel.characterPos = door.getWorldPos()
    }
}

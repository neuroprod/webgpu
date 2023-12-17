import HitTrigger from "./HitTrigger";
import GameModel, {Scenes, Transitions} from "../GameModel";
import {Vector3} from "math.gl";

export default class DoorInsideTrigger extends HitTrigger{

    protected click() {
        let door = GameModel.renderer.modelByLabel["_HitCenterDoor"]
        let world = door.getWorldPos()

        GameModel.characterHandler.walkTo(world,0,this.onCompleteWalk,true)
    }
    onCompleteWalk(){


      if(GameModel.isLeftRoom){

                GameModel.setTransition(Transitions.GO_RIGHT_ROOM)

        }
        else if(!GameModel.isLeftRoom){

                GameModel.setTransition(Transitions.GO_LEFT_ROOM)


        }


       // GameModel.setScene(Scenes.OUTSIDE)
        //let door = GameModel.renderer.modelByLabel["door"]
        //GameModel.characterPos = door.getWorldPos()
    }
}

import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../GameModel";
import {Vector3} from "math.gl";

export default class GoWorkTrigger extends HitTrigger{

    protected click() {
        let obj = GameModel.renderer.modelByLabel["labtop"]
        let world = obj.getWorldPos()
world.z+=1.0;
        GameModel.characterHandler.walkTo(world,Math.PI,this.onCompleteWalk)
    }
    onCompleteWalk(){





        // GameModel.setScene(Scenes.OUTSIDE)
        //let door = GameModel.renderer.modelByLabel["door"]
        //GameModel.characterPos = door.getWorldPos()
    }
}

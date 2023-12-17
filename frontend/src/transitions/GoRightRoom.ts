import Transition from "./Transition";
import GameModel, {Scenes} from "../GameModel";
import gsap from "gsap";
import {Vector3} from "math.gl";
export default class GoRightRoom extends Transition{
    set(onComplete: () => void){

        gsap.to(GameModel,{roomCamOffset:1,duration:2});
        GameModel.isLeftRoom =false;
        let door = GameModel.renderer.modelByLabel["_HitCenterDoor"]
        let world = door.getWorldPos()
        world.x +=2;
        GameModel.characterHandler.walkTo(world,new Vector3())
        onComplete();
    }
}

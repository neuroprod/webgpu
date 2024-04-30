import Transition from "./Transition";
import GameModel from "../../public/GameModel";
import gsap from "gsap";

export default class GoLeftRoom extends Transition {
    set(onComplete: () => void) {

        gsap.to(GameModel, {roomCamOffset: -1, duration: 2});
        GameModel.isLeftRoom = true;

        let door = GameModel.renderer.modelByLabel["_HitCenterDoor"]
        let world = door.getWorldPos()
        world.x -= 2;
        GameModel.characterHandler.walkTo(world, 0)
        onComplete();
    }
}

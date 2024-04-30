import Transition from "./Transition";
import GameModel, {StateFasion, StateGold, StateHighTech} from "../../public/GameModel";
import gsap from "gsap";

export default class GoRightRoom extends Transition {
    set(onComplete: () => void) {

        if (GameModel.stateFashion == StateFasion.READ_MAIL_DONE && GameModel.pantsFound.length >= 2) {
            GameModel.stateFashion = StateFasion.CAN_MAKE_TRIANGLE
        }

        if (GameModel.stateFashion == StateFasion.FINISH_WEBSITE_DONE) {
            GameModel.stateFashion = StateFasion.CAN_READ_MAIL_MAILBOX
        }
        if (GameModel.stateHighTech == StateHighTech.START_MACHINE && GameModel.pantsFound.length >= 4) {
            GameModel.stateHighTech = StateHighTech.STOP_MACHINE
        }
        if (GameModel.stateGold == StateGold.START_MILL && GameModel.pantsFound.length >= 6) {
            GameModel.stateGold = StateGold.FINISH_KEY
        }

        gsap.to(GameModel, {roomCamOffset: 1, duration: 2});
        GameModel.isLeftRoom = false;
        let door = GameModel.renderer.modelByLabel["_HitCenterDoor"]
        let world = door.getWorldPos()
        world.x += 2;
        GameModel.characterHandler.walkTo(world, 0)
        onComplete();
    }
}

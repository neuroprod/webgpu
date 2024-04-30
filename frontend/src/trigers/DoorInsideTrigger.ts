import HitTrigger from "./HitTrigger";
import GameModel, {StateFasion, Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class DoorInsideTrigger extends HitTrigger {

    protected click() {
        GameModel.sound.playClick(0.2)
        if (GameModel.stateFashion == StateFasion.START) {

            GameModel.setTransition(Transitions.TEXT_INFO, "readMailFirst")
            return;
        }
        if (GameModel.stateFashion == StateFasion.CAN_READ_MAIL_MAILBOX && GameModel.roomCamOffset > 0.1) {

            GameModel.setTransition(Transitions.TEXT_INFO, "readMailFirst")
            return;
        }

        if (GameModel.stateFashion == StateFasion.CAN_MAKE_TRIANGLE && GameModel.roomCamOffset > 0) {

            GameModel.setTransition(Transitions.TEXT_INFO, "makeTriangleFirst")
            return;
        }


        let door = GameModel.renderer.modelByLabel["_HitCenterDoor"]
        let world = door.getWorldPos()
        GameModel.gameUI.cursor.hide()
        GameModel.characterHandler.walkTo(world, 0, this.onCompleteWalk, true)
        GameModel.hitObjectLabel = ""
    }

    protected over() {
        //UI.logEvent("Over", this.objectLabel);


        if (GameModel.isLeftRoom) {
            GameModel.gameUI.cursor.show(CURSOR.ARROW_RIGHT)
        } else {
            GameModel.gameUI.cursor.show(CURSOR.ARROW_LEFT)
        }
    }

    protected out() {
        //  UI.logEvent("Out", this.objectLabel);
        GameModel.gameUI.cursor.hide()
    }

    onCompleteWalk() {


        if (GameModel.isLeftRoom) {

            GameModel.setTransition(Transitions.GO_RIGHT_ROOM)

        } else {

            GameModel.setTransition(Transitions.GO_LEFT_ROOM)


        }


        // GameModel.setScene(Scenes.OUTSIDE)
        //let door = GameModel.renderer.modelByLabel["door"]
        //GameModel.characterPos = door.getWorldPos()
    }
}

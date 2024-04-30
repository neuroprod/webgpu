import Transition from "./Transition";
import GameModel, {Scenes} from "../../public/GameModel";
import {Vector3} from "math.gl";
import Timeline from "gsap";
import RenderSettings from "../RenderSettings";

export default class GoInside extends Transition {
    set(onComplete: () => void) {

        this.name = "Inside"

        let ts = Timeline.timeline({onComplete: onComplete})


        RenderSettings.fadeToBlack(0.3)

        ts.call(() => {


            GameModel.setScene(Scenes.ROOM)

            GameModel.sound.playDoor()
            GameModel.sound.stopForest()

        }, [], 1)
        ts.call(() => {
            let door = GameModel.renderer.modelByLabel["door_HO"]
            GameModel.characterPos = door.getWorldPos(new Vector3(0.5, 0, 0))
            GameModel.characterHandler.characterRot = 0
            GameModel.characterPos.y = 0;
            let target = door.getWorldPos(new Vector3(2, 0, 0))
            GameModel.characterHandler.walkTo(target)
            // GameModel.getDrawingByLabel("chapter2_world").visible =false;
            RenderSettings.fadeToScreen(0.5)
        }, [], 1.5)


    }
}

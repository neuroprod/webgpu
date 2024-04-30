import Transition from "./Transition";
import GameModel, {Scenes} from "../../public/GameModel";
import {Vector3} from "math.gl";
import Timeline from "gsap";
import RenderSettings from "../RenderSettings";

export default class GoOutside extends Transition {
    set(onComplete: () => void) {
        this.name = "Outside"

        let ts = Timeline.timeline({onComplete: onComplete})


        RenderSettings.fadeToBlack(0.3)

        ts.call(() => {

            GameModel.setScene(Scenes.OUTSIDE)

            GameModel.sound.playDoor()
            GameModel.sound.playForest();

        }, [], 1)
        ts.call(() => {

            let door = GameModel.renderer.modelByLabel["door"]
            GameModel.characterPos = door.getWorldPos(new Vector3(0, 0, 0.5))
            GameModel.characterPos.y = 0;
            let target = door.getWorldPos(new Vector3(0, 0, 3))
            GameModel.characterHandler.walkTo(target, 0)
            RenderSettings.fadeToScreen(1)
        }, [], 1.5)


    }
}

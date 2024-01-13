import Transition from "./Transition";
import GameModel, {Scenes} from "../GameModel";
import {Vector3} from "math.gl";

export default class GoInside extends Transition{
    set(onComplete: () => void){
        GameModel.setScene(Scenes.ROOM)
        let door = GameModel.renderer.modelByLabel["door_HO"]
        GameModel.characterPos = door.getWorldPos(new Vector3(0.5,0,0))
        GameModel.characterHandler.characterRot =0
        GameModel.characterPos.y=0;
        let target = door.getWorldPos(new Vector3(2,0,0))
        GameModel.characterHandler.walkTo(target)
        GameModel.sound.playDoor()
        GameModel.sound.stopForest()
        onComplete();

    }
}

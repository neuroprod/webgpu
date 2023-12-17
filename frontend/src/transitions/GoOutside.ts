import Transition from "./Transition";
import GameModel, {Scenes} from "../GameModel";
import {Vector3} from "math.gl";

export default class GoOutside extends Transition{
    set(onComplete: () => void){
        GameModel.setScene(Scenes.OUTSIDE)
        let door = GameModel.renderer.modelByLabel["door"]
        GameModel.characterPos = door.getWorldPos(new Vector3(0,0,0.5))
        GameModel.characterPos.y=0;
        let target = door.getWorldPos(new Vector3(0,0,3))
        GameModel.characterHandler.walkTo(target,new Vector3(0,0,0))
        onComplete();
    }
}

import Transition from "./Transition";
import GameModel, {Scenes} from "../GameModel";
import {Vector3} from "math.gl";

export default class StartGame extends Transition{
    set(onComplete: () => void){

        GameModel.setScene(Scenes.ROOM)
        GameModel.characterPos = new Vector3( -GameModel.renderer.ratio * GameModel.sceneHeight,0,-1)
        onComplete();
    }
}

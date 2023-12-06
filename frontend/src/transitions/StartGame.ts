import Transition from "./Transition";
import GameModel, {Scenes} from "../GameModel";

export default class StartGame extends Transition{
    set(onComplete: () => void){

        GameModel.setScene(Scenes.ROOM)
        onComplete();
    }
}

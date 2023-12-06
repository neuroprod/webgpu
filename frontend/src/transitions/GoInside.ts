import Transition from "./Transition";
import GameModel, {Scenes} from "../GameModel";

export default class GoInside extends Transition{
    set(onComplete: () => void){
        GameModel.setScene(Scenes.ROOM)
        onComplete();
    }
}

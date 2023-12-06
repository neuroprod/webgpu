import Transition from "./Transition";
import GameModel, {Scenes} from "../GameModel";

export default class GoOutside extends Transition{
    set(onComplete: () => void){
        GameModel.setScene(Scenes.OUTSIDE)
        onComplete();
    }
}

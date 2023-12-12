import Transition from "./Transition";
import GameModel, {Scenes} from "../GameModel";
import gsap from "gsap";
export default class GoLeftRoom extends Transition{
    set(onComplete: () => void){

        gsap.to(GameModel,{roomCamOffset:0,duration:2});
        GameModel.isLeftRoom =true;
        onComplete();
    }
}

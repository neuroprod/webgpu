import Transition from "./Transition";
import GameModel, {Scenes} from "../GameModel";
import gsap from "gsap";
export default class GoRightRoom extends Transition{
    set(onComplete: () => void){

        gsap.to(GameModel,{roomCamOffset:1,duration:2});
        GameModel.isLeftRoom =false;
        onComplete();
    }
}

import Transition from "./Transition";
import GameModel, {Scenes, UIState} from "../GameModel";
import {Vector3} from "math.gl";
import Timeline from "gsap";
import RenderSettings from "../RenderSettings";

export default class StartGame extends Transition{
    set(onComplete: () => void){
        let ts = Timeline.timeline({onComplete:onComplete})

        GameModel.sound.startMusic();
        RenderSettings.fadeToBlack(2)

        ts.call(()=>{

            GameModel.setScene(Scenes.ROOM)
            GameModel.characterPos.set(2, 0, -1);
            RenderSettings.fadeToScreen(4)
        },[],2)
        ts.call(()=>{
            GameModel.setUIState(UIState.GAME_DEFAULT)

        },[],5)


    }
}

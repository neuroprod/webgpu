import Transition from "./Transition";
import GameModel, {Scenes, UIState} from "../GameModel";
import {Vector3} from "math.gl";
import Timeline from "gsap";
import RenderSettings from "../RenderSettings";

export default class StartGame extends Transition{
    set(onComplete: () => void){
        let ts = Timeline.timeline({onComplete:onComplete})

        GameModel.sound.startMusic();
        RenderSettings.fadeToBlack(1.5)

        ts.call(()=>{
if(GameModel.startOutside){
    GameModel.setScene(Scenes.OUTSIDE)

    GameModel.characterPos.set(-5, 0, -1);
}else{
    GameModel.setScene(Scenes.ROOM)
    GameModel.roomCamOffset=1;
    GameModel.characterPos.set(2, 0, -1);
}

            RenderSettings.fadeToScreen(3)
        },[],2)
        ts.call(()=>{
            GameModel.setUIState(UIState.GAME_DEFAULT)

        },[],4)


    }
}

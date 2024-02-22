
import Transition from "./Transition";
import GameModel, {StateGirl} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class PushBirdHouse extends Transition{
    private isText: boolean =false;


    set(onComplete: () => void){
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("pushBirdHouse")
        this.isText =true;
        GameModel.gameUI.cursor.show(CURSOR.NEXT)


    }
    onCompleteAnimation(){




        GameModel.renderer.modelByLabel["girlPants"].visible =true;
        GameModel.renderer.modelByLabel["girlPants"].enableHitTest=true;
        GameModel.stateGirl =StateGirl.PUSH_BIRDHOUSE
        GameModel.sound.playPickPants();
        setTimeout(()=> {
        GameModel.characterHandler.setAnimationOnce("birdHouse2",0.1,()=>{})
        },1000);

        GameModel.animationMixer.setExtraAnime("pantsFall", this.onCompleteFall.bind(this))

    }
    onCompleteFall(){

        GameModel.renderer.modelByLabel["stickHold"].visible =false
        GameModel.characterHandler.setIdleAndTurn()
        this.onComplete()
    }
    onMouseDown(){
        if(!this.isText){
            return;
        }
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.renderer.modelByLabel["stickHold"].visible =true
            GameModel.characterHandler.setAnimationOnce("birdhouse",0.3,this.onCompleteAnimation.bind(this))
            GameModel.gameUI.cursor.hide()
            this.isText =false;
        }
    }
}

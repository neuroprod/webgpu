import HitTrigger from "./HitTrigger";
import GameModel, {StateGirl, StateGrandpa, Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class BirdHouseTrigger extends HitTrigger{


    protected click() {

        if(GameModel.stateGirl== StateGirl.START) {
            GameModel.setTransition(Transitions.TEXT_INFO, "birdHouseFine")
        }  if(GameModel.stateGirl== StateGirl.BIRD_HOUSE_FELL) {
            GameModel.setTransition(Transitions.TEXT_INFO, "birdHouseFell")
        } if(GameModel.stateGirl== StateGirl.FIND_STICK) {
            let obj = GameModel.renderer.modelByLabel["birdHouse"]
            let world = obj.getWorldPos()
            world.z+=1.5;
            GameModel.hitObjectLabel=""
            GameModel.characterHandler.walkTo(world,Math.PI,this.onCompleteWalk)
        }

        return;
    }
    onCompleteWalk(){
GameModel.setTransition(Transitions.PUSH_BIRDHOUSE)

    }
    public over() {
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["birdHouse"]);

        if(GameModel.stateGirl== StateGirl.FIND_STICK){
            GameModel.gameUI.cursor.show(CURSOR.STICK)
        }else{
            GameModel.gameUI.cursor.show(CURSOR.LOOK)
        }

    }

    public out() {
        GameModel.outlinePass.setModel( null);
        GameModel.gameUI.cursor.hide()

    }
}

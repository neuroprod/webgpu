import HitTrigger from "./HitTrigger";
import GameModel, {StateGold, Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class DigGraveTrigger extends HitTrigger{

    protected click() {
        if(GameModel.stateGold ==StateGold.FIND_NOTE){
            GameModel.setTransition(Transitions.TEXT_INFO,"diggHand")
        }else{
            let obj = GameModel.renderer.modelByLabel["cross"]
            let world = obj.getWorldPos()
            world.z-=1.5;
            world.x+=1;
            GameModel.hitObjectLabel=""
            GameModel.characterHandler.walkTo(world,-0.5,this.onCompleteWalk)
            GameModel.outlinePass.setModel(null);
        }
    }
    onCompleteWalk(){
GameModel.setTransition(Transitions.DIG_GRAVE)


    }
    public over() {
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["grave"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel( null);
        GameModel.gameUI.cursor.hide()

    }
}

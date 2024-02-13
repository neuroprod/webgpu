import HitTrigger from "./HitTrigger";
import GameModel, {StateGold, Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class BookCaseTrigger extends HitTrigger{



    protected click() {
      if(GameModel.stateGold<=StateGold.LOCKED_DOOR){
          GameModel.setTransition(Transitions.TEXT_INFO,"bookCaseLocked")
          GameModel.stateGold=StateGold.LOCKED_DOOR;
          return;
      }
        if(GameModel.stateGold==StateGold.START_MILL){
            GameModel.setTransition(Transitions.TEXT_INFO,"bookCaseLockedMillRunning")

            return;
        }
        if(GameModel.stateGold==StateGold.FINISH_KEY){
            GameModel.setTransition(Transitions.TEXT_INFO,"bookCaseMillFinished")

            return;
        }
        if(GameModel.stateGold==StateGold.HAS_KEY){

            let pot = GameModel.renderer.modelByLabel["bookCaseDoor"]
            let world = pot.getWorldPos(new Vector3(-1, 0, 1))
            GameModel.characterHandler.walkTo(world, Math.PI, this.onCompleteWalk, false)
            return;
        }
    }
    onCompleteWalk(){

       GameModel.setTransition(Transitions.OPEN_BOOKCASE)
    }
    public over() {
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["bookCaseDoor"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel( null);
        GameModel.gameUI.cursor.hide()

    }


}

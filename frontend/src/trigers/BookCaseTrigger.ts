import HitTrigger from "./HitTrigger";
import GameModel, {StateGold, Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class BookCaseTrigger extends HitTrigger{


    protected click() {
      if(GameModel.stateGold<=StateGold.LOCKED_DOOR){
          GameModel.setTransition(Transitions.TEXT_INFO,"bookCaseLocked")
          GameModel.stateGold=StateGold.LOCKED_DOOR;
          return;
      }
        if(GameModel.stateGold==StateGold.START_MILL){
            GameModel.setTransition(Transitions.TEXT_INFO,"bookCaseLockedMillRunning")
            GameModel.stateGold=StateGold.LOCKED_DOOR;
            return;
        }
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

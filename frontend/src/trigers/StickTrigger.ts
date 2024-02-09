import HitTrigger from "./HitTrigger";
import GameModel, { Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class StickTrigger extends HitTrigger{

    protected click() {
        GameModel.setTransition(Transitions.TEXT_INFO,"takeStick")


        return;
    }
    onCompleteWalk(){


    }
    public over() {
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["stick"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel( null);
        GameModel.gameUI.cursor.hide()

    }
}

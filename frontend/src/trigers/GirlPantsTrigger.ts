import HitTrigger from "./HitTrigger";
import GameModel, { Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class GirlPantsTrigger extends HitTrigger{

    protected click() {
        GameModel.setTransition(Transitions.TEXT_INFO,"takeGirlPants")


        return;
    }
    onCompleteWalk(){


    }
    public over() {
        GameModel.outlinePass.setModel( GameModel.renderer.modelByLabel["girlPants"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel( null);
        GameModel.gameUI.cursor.hide()

    }
}

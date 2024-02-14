import HitTrigger from "./HitTrigger";
import GameModel, {StateHighTech, Transitions} from "../GameModel";
import {CURSOR} from "../ui/Cursor";
import {Vector3} from "math.gl";

export default class HighTechPantsTrigger extends HitTrigger {




    public over() {
        if(GameModel.stateHighTech != StateHighTech.STOP_MACHINE )return
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["pantsGlow"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        if(GameModel.stateHighTech != StateHighTech.STOP_MACHINE )return
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }

    protected click() {

        let obj = GameModel.renderer.modelByLabel["pantsGlow"]
        let world = obj.getWorldPos()
        world.x-=0.7;
        GameModel.characterHandler.walkTo(world,Math.PI/2,this.onCompleteWalk)

        return;
    }
    onCompleteWalk(){

        GameModel.setTransition(Transitions.FIND_GLOW_PANTS)
    }

}

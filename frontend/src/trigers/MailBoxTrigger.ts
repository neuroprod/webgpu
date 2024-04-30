import HitTrigger from "./HitTrigger";
import GameModel, {Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class MailBoxTrigger extends HitTrigger {


    protected click() {
        GameModel.sound.playClick(0.2)
        GameModel.setTransition(Transitions.TEXT_INFO, "noMail")
        return;


    }

    onCompleteWalk() {
        // GameModel.setTransition(Transitions.PICK_FLOWER);

    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel["mailBox"]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }


}

import HitTrigger from "./HitTrigger";
import GameModel, {Scenes, Transitions} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class HitTextTrigger extends HitTrigger {
    private infoTextLabel: string;

    constructor(scene: Scenes, objectLabel: string) {
        super(scene, objectLabel);


    }

    public over() {
        GameModel.outlinePass.setModel(GameModel.renderer.modelByLabel[this.objectLabels[0]]);
        GameModel.gameUI.cursor.show(CURSOR.LOOK)

    }

    public out() {
        GameModel.outlinePass.setModel(null);
        GameModel.gameUI.cursor.hide()

    }

    public click() {

        GameModel.setTransition(Transitions.TEXT_INFO, this.objectLabels[0])

    }

}

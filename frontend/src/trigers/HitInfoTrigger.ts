import HitTrigger from "./HitTrigger";
import GameModel, {Scenes} from "../GameModel";
import UI from "../lib/UI/UI";

export default class HitInfoTrigger extends HitTrigger{

    constructor(scene:Scenes,objectLabel:string) {
        super(scene,objectLabel);


    }
    public over() {
        UI.logEvent("Over", this.objectLabel);
        let drawing =GameModel.getDrawingByLabel("gooutside_door_HO")
        drawing.show()
    }

    public out() {
          UI.logEvent("Out", this.objectLabel);
        let drawing =GameModel.getDrawingByLabel("gooutside_door_HO")
        drawing.hideDelay(2);
    }
    public  click(){

        UI.logEvent("Click", this.objectLabel);

    }

}

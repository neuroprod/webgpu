import HitTrigger from "./HitTrigger";
import GameModel, {Scenes} from "../GameModel";
import UI from "../lib/UI/UI";

export default class HitInfoTrigger extends HitTrigger{
    private infoTextLabel: string;

    constructor(scene:Scenes,objectLabel:string,infoTextLabel:string) {
        super(scene,objectLabel);
        this.infoTextLabel = infoTextLabel;

    }
    public over() {
        UI.logEvent("Over", this.objectLabel);
        let drawing =GameModel.getDrawingByLabel(this.infoTextLabel);
        console.log(drawing)
        drawing.show()
    }

    public out() {
          UI.logEvent("Out", this.objectLabel);
        let drawing =GameModel.getDrawingByLabel(this.infoTextLabel);
        drawing.hideDelay(2);
    }
    public  click(){

        UI.logEvent("Click", this.objectLabel);

    }

}

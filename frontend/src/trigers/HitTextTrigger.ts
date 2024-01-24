import HitTrigger from "./HitTrigger";
import GameModel, {Scenes, Transitions} from "../GameModel";
import UI from "../lib/UI/UI";

export default class HitTextTrigger extends HitTrigger{
    private infoTextLabel: string;

    constructor(scene:Scenes,objectLabel:string) {
        super(scene,objectLabel);


    }
    public over() {



    }

    public out() {


    }
    public  click(){
        console.log(this.objectLabels[0])
        GameModel.setTransition(Transitions.TEXT_INFO,this.objectLabels[0])

    }

}

import gsap from "gsap"
import Model from "../lib/model/Model";
import GameModel, {MillState} from "../GameModel";

export default class Mill{
    private millBed: Model;
    private millHead: Model;
    private millControle: Model;
    private headPos: number =0.1;
    private tl: gsap.core.Timeline;
    private bedZ: number =-0.2;


    constructor(mill:Model) {
        this.millBed =mill.children[0]as Model;
        this.millHead =mill.children[2]as Model;
        this.millControle =mill.children[1]as Model;







        return;


    }
    update(){

        this.millHead.setPosition(0,this.headPos,0)
        this.millBed.setPosition(0,0,this.bedZ)
    }

    setState(state: MillState) {
        if(state==MillState.OFF){
            if(this.tl)this.tl.clear()
            this.headPos=0.1;
            this.bedZ =-0.2;
            GameModel.renderer.modelByLabel["keyStock"].visible =true;
            GameModel.renderer.modelByLabel["key"].visible =false
        }else if(state==MillState.ON){
            GameModel.renderer.modelByLabel["keyStock"].visible =true;
            GameModel.renderer.modelByLabel["key"].visible =false
            if(this.tl) this.tl.clear()
            this.headPos=0.1;
            this.bedZ =-0.2;
            this.tl = gsap.timeline({repeat: -1, repeatDelay: 1,});
            this.tl.timeScale(3);

            this.tl.to(this,{"headPos":0.0,ease: "sine.inOut"})
            this.tl.to(this,{"bedZ":0.2,duration:4,ease: "sine.inOut"},">")
            this.tl.to(this,{"headPos":0.1,ease: "sine.inOut"},">")
            this.tl.to(this,{"bedZ":-0.2,duration:2,ease: "sine.inOut"},"<")

        }
        else if(state==MillState.DONE){
            if(this.tl) this.tl.clear()
            this.headPos=0.3;
            this.bedZ =-0.0;
            GameModel.renderer.modelByLabel["keyStock"].visible =false;
            GameModel.renderer.modelByLabel["key"].visible =true;
        }
    }
}

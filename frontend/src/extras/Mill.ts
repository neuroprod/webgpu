import Object3D from "../lib/core/Object3D";
import Timer from "../lib/Timer";
import gsap from "gsap"
export default class Mill{
    private millBed: Object3D;
    private millHead: Object3D;
    private headPos: number =0.1;
    private tl: gsap.core.Timeline;
    private bedZ: number =-0.2;


    constructor(mill:Object3D) {
        this.millBed =mill.children[0];
        this.millHead =mill.children[2];

        this.tl = gsap.timeline({repeat: 1000, repeatDelay: 1});
        this.tl.to(this,{"headPos":0.0,ease: "sine.inOut"})
        this.tl.to(this,{"bedZ":0.2,duration:4,ease: "sine.inOut"},">")
        this.tl.to(this,{"headPos":0.1,ease: "sine.inOut"},">")
        this.tl.to(this,{"bedZ":-0.2,duration:2,ease: "sine.inOut"},"<")
    }
    update(){

        this.millHead.setPosition(0,this.headPos,0)
        this.millBed.setPosition(0,0,this.bedZ)
    }

}

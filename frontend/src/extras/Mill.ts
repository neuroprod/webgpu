import Object3D from "../lib/core/Object3D";
import Timer from "../lib/Timer";
import gsap from "gsap"
import Model from "../lib/model/Model";
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


        mill.hitFriends.push( this.millBed)
        mill.hitFriends.push( this.millHead)
        mill.hitFriends.push( this.millControle)

        this.millBed.hitFriends.push( mill)
        this.millBed.hitFriends.push( this.millHead)
        this.millBed.hitFriends.push( this.millControle)

        this.millHead.hitFriends.push( this.millBed)
        this.millHead.hitFriends.push( mill)
        this.millHead.hitFriends.push( this.millControle)

        this.millControle.hitFriends.push( this.millBed)
        this.millControle.hitFriends.push( this.millHead)
        this.millControle.hitFriends.push( mill)





        return;

        this.tl = gsap.timeline({repeat: -1, repeatDelay: 1,});
        this.tl.timeScale(3);
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

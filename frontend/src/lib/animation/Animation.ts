import ObjectGPU from "../core/ObjectGPU";
import Renderer from "../Renderer";
import AnimationChannel from "./AnimationChannel";
import Timer from "../Timer";

class AnimationCallBack {
    time: number;
    callBack: () => void;
    constructor(time: number, callBack: () => void) {
        this.time =time;
        this.callBack =callBack;
    }

}

export default class Animation extends ObjectGPU
{
    public channels: Array<AnimationChannel>=[] ;
    private startTime :number=Number.MAX_VALUE;
    private stopTime :number=Number.MIN_VALUE;
   public time:number =0;
    private totalTime: number;
    private prevTime: number =0;
    private callBacks:Array<AnimationCallBack>=[]

    constructor(renderer:Renderer,label:string) {
        super(renderer,label)

    }

    addChannel(channel: AnimationChannel) {
        this.startTime = Math.min(channel.startTime,this.startTime)
        this.stopTime = Math.max(channel.stopTime,this.stopTime)
        this.channels.push(channel)

    }
    init(){
        this.totalTime =this.stopTime-this.startTime;
        for(let c of this.channels)
        {
            c.setToObj();
        }
    }
    update()
    {
        this.time +=Timer.delta;
        if(this.time>this.totalTime){
            this.time-=this.totalTime;
        }
        let t = this.time+this.startTime;
        for(let c of this.callBacks){
            if(c.time<t && c.time>this.prevTime)
            {

                c.callBack();
            }
        }

        this.prevTime = t;
        for(let c of this.channels)
        {
            c.setTime(t);
        }
    }

    set() {
        for(let c of this.channels)
        {
            c.setToObj()
        }
    }

    setCallBack(time: number, callBack: () => void) {
        let a =new AnimationCallBack(time,callBack);
        this.callBacks.push(a);
    }
}

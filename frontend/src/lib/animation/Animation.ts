import ObjectGPU from "../core/ObjectGPU";
import Renderer from "../Renderer";
import AnimationChannel from "./AnimationChannel";
import Timer from "../Timer";

export default class Animation extends ObjectGPU
{
    public channels: Array<AnimationChannel>=[] ;
    private startTime :number=Number.MAX_VALUE;
    private stopTime :number=Number.MIN_VALUE;
   public time:number =0;
    private totalTime: number;
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
}

import ObjectGPU from "../core/ObjectGPU";
import Renderer from "../Renderer";
import AnimationChannel from "./AnimationChannel";

export default class Animation extends ObjectGPU
{
    private channels: Array<AnimationChannel>=[] ;
    private startTime :number=Number.MAX_VALUE;
    private stopTime :number=Number.MIN_VALUE;
    private time:number =0;
    constructor(renderer:Renderer,label:string) {
        super(renderer,label)

    }

    addChannel(channel: AnimationChannel) {
        this.stopTime = Math.min(channel.startTime,this.startTime)
        this.startTime = Math.max(channel.stopTime,this.stopTime)
        this.channels.push(channel)
    }
    init(){

    }
    update()
    {

    }
}

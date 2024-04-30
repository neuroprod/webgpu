import ObjectGPU from "../core/ObjectGPU";
import Renderer from "../Renderer";
import AnimationChannel from "./AnimationChannel";
import Timer from "../Timer";


class AnimationCallBack {
    time: number;
    callBack: () => void;

    constructor(time: number, callBack: () => void) {
        this.time = time;
        this.callBack = callBack;
    }

}

export default class Animation extends ObjectGPU {
    public channels: Array<AnimationChannel> = [];

    public channelsByName: { [name: string]: AnimationChannel } = {};
    private startTime: number = Number.MAX_VALUE;
    private stopTime: number = Number.MIN_VALUE;
    public time: number = 0;
    private totalTime: number;
    private prevTime: number = 0;
    private callBacks: Array<AnimationCallBack> = []
    public mixValue: number = 0;
    public isMixAnimation: boolean = false;
    public speedMultiplier = 1;
    playOnce: boolean = false;
    completeCallBack: () => void = () => {
    };
    animationDone: boolean = false;

    constructor(renderer: Renderer, label: string) {
        super(renderer, label)

    }

    addChannel(channel: AnimationChannel) {
        this.channelsByName[channel.name] = channel;
        this.startTime = Math.min(channel.startTime, this.startTime)
        this.stopTime = Math.max(channel.stopTime, this.stopTime)
        this.channels.push(channel)

    }

    init() {
        this.totalTime = this.stopTime - this.startTime;
        for (let c of this.channels) {
            c.setToObj();
        }
    }

    update() {
        this.time += Timer.delta * this.speedMultiplier;
        if (this.time > this.totalTime) {
            if (this.playOnce) {
                this.time = this.totalTime;
                if (!this.animationDone) {
                    this.completeCallBack()
                    this.animationDone = true;
                }

            } else {
                this.time -= this.totalTime;
            }

        }
        let t = this.time + this.startTime;
        for (let c of this.callBacks) {
            if (c.time < t && c.time > this.prevTime) {

                c.callBack();
            }
        }

        this.prevTime = t;
        for (let c of this.channels) {
            c.setTime(t);
        }
    }

    set() {
        for (let c of this.channels) {
            c.setToObj()
        }
    }

    setCallBack(time: number, callBack: () => void) {
        let a = new AnimationCallBack(time, callBack);
        this.callBacks.push(a);
    }

    setStartValue() {
        for (let c of this.channels) {
            c.setStart();
        }
    }

    setAsMixAnimation(strings: string[]) {
        this.mixValue = 0;
        this.isMixAnimation = true;
        let tempChannels = []
        for (let c of this.channels) {
            for (let f of strings) {
                if (c.target.label.includes(f)) {

                    // if(c.type=="rotation") {
                    tempChannels.push(c)
                    // c.setTime(0);
                    //}

                }
            }

        }
        this.channels = tempChannels;
    }
}

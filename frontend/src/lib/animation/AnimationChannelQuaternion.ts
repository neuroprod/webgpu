import AnimationChannel from "./AnimationChannel";
import Object3D from "../core/Object3D";
import {Quaternion} from "math.gl";

export default class AnimationChannelQuaternion extends AnimationChannel {
    private data: Array<Quaternion>;

    constructor(type: "rotation", startTime: number, stopTime: number, interpolation: "STEP" | "LINEAR", timeData: Array<number>, target: Object3D) {
        super(type, startTime, stopTime, interpolation, timeData, target)
        this.result = new Quaternion()
    }

    setData(data: Array<Quaternion>) {
        this.data = data;
        this.result.from(this.data[0]);

    }

    protected setForTime() {
        this.result.from(this.data[this.firstIndex]);
        if (this.mixValue > 0) {
            // @ts-ignore
            this.result.slerp(this.data[this.nextIndex], this.mixValue)
        }


    }

    mix(other: Quaternion, value: number) {
        let r = this.result as Quaternion;
        r.slerp(other, value);

    }

    setToObj() {
        //  console.log("setRotation",this.result)
        let r = this.result as Quaternion;
        this.target.setRotation(r.x, r.y, r.z, r.w)
    }
}

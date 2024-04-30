import AnimationChannel from "./AnimationChannel";
import Object3D from "../core/Object3D";
import {Vector3} from "math.gl";

export default class AnimationChannelVector3 extends AnimationChannel {
    private data: Array<Vector3>;


    constructor(type: "translation" | "scale", startTime: number, stopTime: number, interpolation: "STEP" | "LINEAR", timeData: Array<number>, target: Object3D) {
        super(type, startTime, stopTime, interpolation, timeData, target)
        this.result = new Vector3()
    }

    setData(data: Array<Vector3>) {
        this.data = data;
        this.result.from(this.data[0]);
    }

    setToObj() {
        if (this.type == "scale") {
            // console.log("setScale",this.result)
            this.target.setScale(this.result.x, this.result.y, this.result.z)
        } else {

            this.target.setPosition(this.result.x, this.result.y, this.result.z)
        }

    }

    mix(other: Vector3, value: number) {
        (this.result as Vector3).lerp(other, value);

    }

    protected setForTime() {
        this.result.from(this.data[this.firstIndex])
        if (this.mixValue > 0) {

            this.result.lerp(this.data[this.nextIndex], this.mixValue)
        }


    }

}

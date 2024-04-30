import Object3D from "../core/Object3D";
import {Quaternion, Vector3} from "math.gl";

export default class AnimationChannel {
    type: "translation" | "rotation" | "scale";
    startTime: number;
    stopTime: number;
    private interpolation: "STEP" | "LINEAR";
    private timeData: Array<number>;
    public target: Object3D;
    private hasAnime: boolean = true;

    public result: Quaternion | Vector3;
    protected nextIndex: number;
    protected firstIndex: number = 0;
    protected mixValue: number = -1;
    public name: string = ""

    constructor(type: "translation" | "rotation" | "scale", startTime: number, stopTime: number, interpolation: "STEP" | "LINEAR", timeData: Array<number>, target: Object3D) {

        this.name = type + target.label;
        this.type = type;
        this.startTime = startTime * 2;
        this.stopTime = stopTime * 2
        this.interpolation = interpolation;
        this.timeData = timeData;
        for (let i = 1; i < this.timeData.length; i++) {
            this.timeData[i] *= 2;
        }
        this.target = target;
        if (this.timeData.length == 2) {
            this.hasAnime = false;
        } else {
///console.log(timeData)
            // if(this.type=="translation"){console.log("trans",this.timeData.length)}
        }
    }

    mix(other: Vector3 | Quaternion, value: number) {

    }

    setTime(t: number) {
        if (!this.hasAnime) {
            this.mixValue = 0;
            this.setForTime();
        }
        for (let i = 1; i < this.timeData.length; i++) {
            if (t < this.timeData[i]) {
                this.firstIndex = i - 1;
                if (this.interpolation == "LINEAR") {
                    this.nextIndex = i;
                    let timeLength = this.timeData[this.nextIndex] - this.timeData[this.firstIndex];
                    let timeStep = t - this.timeData[this.firstIndex];
                    this.mixValue = timeStep / timeLength;

                }

                break;
            }
        }

        this.setForTime();
    }

    setToObj() {

    }

    protected setForTime() {

    }

    setStart() {

    }
}

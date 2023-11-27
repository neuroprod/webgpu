import AnimationChannel from "./AnimationChannel";
import Object3D from "../core/Object3D";
import {Quaternion} from "math.gl";

export default class AnimationChannelQuaternion extends AnimationChannel{
    private data: Array<Quaternion>;

    constructor(type:"rotation",startTime:number,stopTime:number,interpolation:"STEP"|"LINEAR",timeData:Array<number>,target:Object3D) {
        super(type,startTime,stopTime,interpolation,timeData,target)
    }

    setData(data: Array<Quaternion>) {
        this.data =data;

    }
}

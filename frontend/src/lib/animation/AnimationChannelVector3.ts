import AnimationChannel from "./AnimationChannel";
import Object3D from "../core/Object3D";
import {Vector3} from "math.gl";

export default class AnimationChannelVector3 extends AnimationChannel{
    private data: Array<Vector3>;

    constructor(type:"translation"|"scale",startTime:number,stopTime:number,interpolation:"STEP"|"LINEAR",timeData:Array<number>,target:Object3D) {
        super(type,startTime,stopTime,interpolation,timeData,target)
    }

    setData(data: Array<Vector3>){
        this.data =data;
    }
}

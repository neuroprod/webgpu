import AnimationChannel from "./AnimationChannel";
import Object3D from "../core/Object3D";
import {Quaternion} from "math.gl";

export default class AnimationChannelQuaternion extends AnimationChannel{
    private data: Array<Quaternion>;
    private result:Quaternion;
    constructor(type:"rotation",startTime:number,stopTime:number,interpolation:"STEP"|"LINEAR",timeData:Array<number>,target:Object3D) {
        super(type,startTime,stopTime,interpolation,timeData,target)
    }

    setData(data: Array<Quaternion>) {
        this.data =data;
        this.result = this.data[0].clone()
//console.log(this.target.label,this.result)
    }
    protected setForTime() {
        let fq = this.data[this.firstIndex];
        this.result.set(fq.x,fq.y,fq.z,fq.w);

    }
    setToObj() {
      //  console.log("setRotation",this.result)

       this.target.setRotation( this.result.x,this.result.y,this.result.z,this.result.w)
    }
}

import AnimationChannel from "./AnimationChannel";
import Object3D from "../core/Object3D";
import {Quaternion, Vector3} from "math.gl";

export default class AnimationChannelQuaternion extends AnimationChannel{
    private data: Array<Quaternion>;

    constructor(type:"rotation",startTime:number,stopTime:number,interpolation:"STEP"|"LINEAR",timeData:Array<number>,target:Object3D) {
        super(type,startTime,stopTime,interpolation,timeData,target)
    }

    setData(data: Array<Quaternion>) {
        this.data =data;
        this.result = this.data[0].clone()
//console.log(this.target.label,this.result)
    }
    protected setForTime() {
        let fq = this.data[this.firstIndex].clone();
        if(this.mixValue>0){
            fq.slerp(this.data[this.nextIndex],this.mixValue)
        }
        this.result.set(fq.x,fq.y,fq.z,fq.w);

    }
    mix(other:Quaternion,value:number){
        let r =this.result as Quaternion;
        r.slerp(other,value);

    }
    setToObj() {
      //  console.log("setRotation",this.result)
        let r =this.result as Quaternion;
       this.target.setRotation( r.x,r.y,r.z,r.w)
    }
}

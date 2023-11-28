import AnimationChannel from "./AnimationChannel";
import Object3D from "../core/Object3D";
import {Quaternion, Vector3} from "math.gl";

export default class AnimationChannelVector3 extends AnimationChannel{
    private data: Array<Vector3>;


    constructor(type:"translation"|"scale",startTime:number,stopTime:number,interpolation:"STEP"|"LINEAR",timeData:Array<number>,target:Object3D) {
        super(type,startTime,stopTime,interpolation,timeData,target)
    }

    setData(data: Array<Vector3>){
        this.data =data;
        this.result =this.data[0].clone();
    }
    setToObj() {
        if(this.type=="scale"){
           // console.log("setScale",this.result)
            this.target.setScale(this.result.x,this.result.y,this.result.z)
        }else{

           this.target.setPosition(this.result.x,this.result.y,this.result.z)
        }

    }
    mix(other:Vector3,value:number){
       (this.result as Vector3).lerp(other,value);

    }
    protected setForTime() {
        let fq = this.data[this.firstIndex].clone();
        if(this.mixValue>0){

            fq.lerp(this.data[this.nextIndex],this.mixValue)
        }

        (this.result as Vector3).set(fq.x,fq.y,fq.z);

    }

}

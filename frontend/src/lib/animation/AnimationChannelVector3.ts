import AnimationChannel from "./AnimationChannel";
import Object3D from "../core/Object3D";
import {Vector3} from "math.gl";

export default class AnimationChannelVector3 extends AnimationChannel{
    private data: Array<Vector3>;
    private result: Vector3;

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
    protected setForTime() {
        let fq = this.data[this.firstIndex];
        this.result.set(fq.x,fq.y,fq.z);

    }

}

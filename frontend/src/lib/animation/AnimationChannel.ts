import Object3D from "../core/Object3D";
import {Quaternion, Vector3} from "math.gl";

export default class AnimationChannel{
    type: "translation"|"rotation"|"scale";
    startTime:number;
    stopTime:number;
    private interpolation: "STEP" | "LINEAR";
    private timeData: Array<number>;
    public target: Object3D;
    private hasAnime: boolean=true;
    protected firstIndex: number;
    public result:Quaternion|Vector3;
    constructor(type:"translation"|"rotation"|"scale",startTime:number,stopTime:number,interpolation:"STEP"|"LINEAR",timeData:Array<number>,target:Object3D) {
        this.type =type;
        this.startTime =startTime;
        this.stopTime=stopTime
        this.interpolation =interpolation;
        this.timeData =timeData;
        this.target=target;
        if(this.timeData.length==2 && this.interpolation=="STEP"){
             this.hasAnime =false;
        }else{

        }
    }
    mix(other:Vector3|Quaternion,value:number){

    }
    setTime(t: number) {
        if(!this.hasAnime)return;
        for(let i =0;i<this.timeData.length;i++){
            if(this.timeData[i]>t){
                this.firstIndex =i;
                break;
            }
        }

        this.setForTime();
    }

    setToObj() {

    }

    protected setForTime() {

    }
}

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

    public result:Quaternion|Vector3;
    protected nextIndex: number;
    protected firstIndex: number;
    protected  mixValue :number=-1;
    constructor(type:"translation"|"rotation"|"scale",startTime:number,stopTime:number,interpolation:"STEP"|"LINEAR",timeData:Array<number>,target:Object3D) {
        this.type =type;
        this.startTime =startTime;
        this.stopTime=stopTime
        this.interpolation =interpolation;
        this.timeData =timeData;
        this.target=target;
        if(this.timeData.length==2  ){
             this.hasAnime =false;
        }else{
///console.log(timeData)
           // if(this.type=="translation"){console.log("trans",this.timeData.length)}
        }
    }
    mix(other:Vector3|Quaternion,value:number){

    }
    setTime(t: number) {
    if(!this.hasAnime)return;
        for(let i =1;i<this.timeData.length;i++){
            if(t<this.timeData[i]){
                this.firstIndex =i-1;
                if(this.interpolation== "LINEAR"){
                    this.nextIndex =i;
                    let timeLength =this.timeData[this.nextIndex]- this.timeData[this.firstIndex] ;
                    let timeStep = t-this.timeData[this.firstIndex];
                    this.mixValue = timeStep/timeLength;

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

import Object3D from "../core/Object3D";

export default class AnimationChannel{
    type: "translation"|"rotation"|"scale";
    startTime:number;
    stopTime:number;
    private interpolation: "STEP" | "LINEAR";
    private timeData: Array<number>;
    protected target: Object3D;
    private hasAnime: boolean=true;
    protected firstIndex: number;
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

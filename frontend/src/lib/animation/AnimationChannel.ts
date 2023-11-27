import Object3D from "../core/Object3D";

export default class AnimationChannel{
    type: "translation"|"rotation"|"scale";
    startTime:number;
    stopTime:number;
    private interpolation: "STEP" | "LINEAR";
    private timeData: Array<number>;
    private target: Object3D;
    constructor(type:"translation"|"rotation"|"scale",startTime:number,stopTime:number,interpolation:"STEP"|"LINEAR",timeData:Array<number>,target:Object3D) {
        this.type =type;
        this.startTime =startTime;
        this.stopTime=stopTime
        this.interpolation =interpolation;
        this.timeData =timeData;
        this.target=target;
    }

}

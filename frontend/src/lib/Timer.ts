import {lerp} from "math.gl";
import UI from "./UI/UI";

class Clock {

    public frame: number = 0;
    public time: number = 0;
    public delta: number = 0;
    public deltaSmooth: number = 0.016;
    public fps = 60;
    private prevTime: number;

    constructor() {
        this.prevTime = Date.now()
    }

    onUI() {

        UI.LText(this.fps + "", "FPS");
    }

    update() {
        let now = Date.now()
        this.delta = (now - this.prevTime) / 1000;

        this.deltaSmooth = lerp(this.deltaSmooth, this.delta, 0.3);
        this.fps = Math.round(1 / this.deltaSmooth);
        this.time += this.delta;
        this.frame++;
        this.prevTime = now;
    }

}

export default new Clock()

import UI from "./UI/UI";

export default class CanvasManager {
    canvas: HTMLCanvasElement;
    private resizeTimeOut: ReturnType<typeof setTimeout>;
    public pixelRatio: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.pixelRatio = window.devicePixelRatio;
        this.resize();
        window.onresize = this.delayedResize.bind(this);

    }

    resize() {
        this.canvas.style.width =Math.floor(  window.innerWidth) + "px";
        this.canvas.style.height = Math.floor( window.innerHeight) + "px";
        this.canvas.width =Math.floor( window.innerWidth * this.pixelRatio);
        this.canvas.height = Math.floor(window.innerHeight * this.pixelRatio);
        UI.setSize(this.canvas.width, this.canvas.height)
    }

    delayedResize() {
        clearTimeout(this.resizeTimeOut);

        this.resizeTimeOut = setTimeout(() => {
            this.resize();
        }, 100);
    }
}

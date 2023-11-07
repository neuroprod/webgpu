export default class CanvasManager {
  private canvas: HTMLCanvasElement;
  private resizeTimeOut: ReturnType<typeof setTimeout>;
  private pixelRatio: number = 1;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.pixelRatio = window.devicePixelRatio;
    this.resize();
    window.onresize = this.delayedResize.bind(this);

  }
  resize() {
    this.canvas.style.width = window.innerWidth + "px";
    this.canvas.style.height = window.innerHeight + "px";
    this.canvas.width = window.innerWidth * this.pixelRatio;
    this.canvas.height = window.innerHeight * this.pixelRatio;
  }
  delayedResize() {
    clearTimeout(this.resizeTimeOut);

    this.resizeTimeOut = setTimeout(()=>{this.resize();}, 100);
  }
}

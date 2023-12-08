import Ray from "../lib/Ray";
import {Vector2, Vector3} from "math.gl";
import DrawLine from "./DrawLine";
import UI from "../lib/UI/UI";
import Drawing from "./Drawing";
import Renderer from "../lib/Renderer";
import SelectItem from "../lib/UI/math/SelectItem";
import GameModel from "../GameModel";
import ColorV from "../lib/ColorV";
import gsap  from "gsap";
import {saveToBinFile} from "../lib/SaveUtils";
export default class Drawer {
    enabled: boolean = true;
    drawing: Drawing;
    public drawSize = 0.02;
    private currentLine: DrawLine;
    private lines: Array<DrawLine> = [];
    private isDrawing: boolean = false;
    private pointCount: number=0;
    private renderer: Renderer;
    private parentArray:Array<SelectItem>=[]
    private currentParent ="world"
    private color:ColorV =new ColorV(1,1,1,1)
    private dataArr: Float32Array;
    private dataArrSmall: Int16Array;
    constructor(renderer: Renderer) {
        this.drawing = new Drawing(renderer, "drawerDrawing")
        this.renderer =renderer;

        this.parentArray.push(new SelectItem('world','world'));
        for(let l of this.renderer.modelLabels) {
            this.parentArray.push(new SelectItem(l,l));
        }
    }

    setMouseData(mouseDown: boolean, mouseUp: boolean, ray: Ray) {


        if (mouseDown) {
            this.currentLine = new DrawLine()
            this.currentLine.drawSize = this.drawSize;
            this.lines.push(this.currentLine);

            this.isDrawing = true;
        }
        if (this.isDrawing) {
            ray.intersectPlane(this.drawing.getWorldPos(), new Vector3(0, 0, 1));
            let pos = new Vector2(ray.hitPos.x, ray.hitPos.y)
            this.currentLine.addPoint(pos);
            this.updateDrawing()
        }
        if (mouseUp) {
            if (this.isDrawing) {

                this.isDrawing = false;
                this.currentLine.smoothing()
                this.currentLine.smoothing()

                this.updateDrawing()
            }
        }


    }

    onUI() {
        UI.pushWindow("drawing")
        if (UI.LBool("Enable", this.enabled)) {
            this.enabled = true;
          this.drawing.visible = true;
        } else {
            this.enabled = false
            //this.drawing.visible = false;
        }
        GameModel.lockView =UI.LBool("LockView", GameModel.lockView);
        UI.LFloatSlider(this.drawing,"progress",0.0,1.0)

        if(UI.LButton("Play")){
            this.drawing.progress=0.0;
            gsap.to(this.drawing,{progress:1,duration:2,ease:"power4.inOut"})
        }
        UI.LText(Math.round((this.pointCount*2*3)/1000)+"Kb","dataComp?")

        let  p = UI.LSelect("parent",this.parentArray)
        UI.LVector("offset",this.drawing.offset)
        UI.LColor("color",this.color);
        this.drawing.material.uniforms.setUniform('color',this.color)
        if(p != this.currentParent){

            if(p=="world"){
                this.drawing.worldParent =null;
            }
            else{
                this.drawing.worldParent =this.renderer.modelByLabel[p];
            }
            this.currentParent =p;
        }
        this.drawSize = UI.LFloatSlider("Size", this.drawSize * 10, 0.01, 1,) / 10;
        if (UI.LButton("Undo")) {
            this.lines.pop();
            this.updateDrawing()
        }

        if (UI.LButton("clear")) {
            this.lines = [];
            this.updateDrawing()
        }
        let name =UI.LTextInput("name","name")
        if (UI.LButton("save")) {


            saveToBinFile( this.dataArrSmall,name+"_"+this.currentParent)
        }
        UI.popWindow()
    }


    private updateDrawing() {
        let size = 0;
        let sizeS = 0;
        for (let l of this.lines) {
           size+= l.points.length*4;
           sizeS+= l.points.length*3;
        }
        this.dataArrSmall =new Int16Array(sizeS)
        this.dataArr = new Float32Array(size);
        let pointCount = 0;
        for (let l of this.lines) {

            for (let p of l.points) {

                let pos = pointCount * 4;
                let posS = pointCount * 3;
                this.dataArrSmall[posS++]=Math.round(p.x*1000)
                this.dataArrSmall[posS++]=Math.round(p.y*1000)
                this.dataArrSmall[posS++]=Math.round(l.drawSize*1000)

                this.dataArr[pos++] = p.x;
                this.dataArr[pos++] = p.y;
                this.dataArr[pos++] = l.drawSize;
                this.dataArr[pos++] = 0.0;
                pointCount++;
            }


        }
        this.drawing.createBuffer(this.dataArr,"instanceBuffer")
        this.drawing.numDrawInstancesMax = pointCount;
        this.drawing.numDrawInstances = pointCount;
        this.pointCount =pointCount;

    }
}

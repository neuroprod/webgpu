import Ray from "../lib/Ray";
import {Vector2, Vector3} from "math.gl";
import DrawLine from "./DrawLine";
import UI from "../lib/UI/UI";
import Drawing from "./Drawing";
import Renderer from "../lib/Renderer";
import SelectItem from "../lib/UI/math/SelectItem";
import GameModel from "../GameModel";
import ColorV from "../lib/ColorV";

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
        if (UI.LButton("clear")) {
            this.lines = [];
            this.updateDrawing()
        }
        if (UI.LButton("Undo")) {
            this.lines.pop();
            this.updateDrawing()
        }
        UI.popWindow()
    }


    private updateDrawing() {
        let size = 0;
        for (let l of this.lines) {
           size+= l.points.length*4;
        }

        let dataArr = new Float32Array(size);
        let pointCount = 0;
        for (let l of this.lines) {

            for (let p of l.points) {

                let pos = pointCount * 4;

                dataArr[pos++] = p.x;
                dataArr[pos++] = p.y;
                dataArr[pos++] = l.drawSize;
                dataArr[pos++] = 0.0;
                pointCount++;
            }


        }
        this.drawing.createBuffer(dataArr,"instanceBuffer")
        this.drawing.numDrawInstancesMax = pointCount;
        this.drawing.numDrawInstances = pointCount;
        this.pointCount =pointCount;

    }
}

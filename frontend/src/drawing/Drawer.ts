import Ray from "../lib/Ray";
import {Vector2, Vector3} from "math.gl";
import DrawLine from "./DrawLine";
import UI from "../lib/UI/UI";
import Drawing from "./Drawing";
import Renderer from "../lib/Renderer";
import SelectItem from "../lib/UI/math/SelectItem";
import GameModel from "../../public/GameModel";
import ColorV from "../lib/ColorV";
import gsap from "gsap";
import {saveToBinFile} from "../lib/SaveUtils";

export default class Drawer {
    enabled: boolean = false;
    drawing: Drawing;
    public drawSize = 0.02;
    private currentLine: DrawLine;
    private lines: Array<DrawLine> = [];
    private isDrawing: boolean = false;
    private pointCount: number = 0;
    private renderer: Renderer;
    private sceneArray: Array<SelectItem> = []
    private parentArray: Array<SelectItem> = []
    private currentParent = "world"
    private color: ColorV = new ColorV(1, 1, 1, 1)
    private dataArr: Float32Array;
    private dataArrSmall: Int16Array;
    private sceneID: number = 0;

    constructor(renderer: Renderer) {
        this.drawing = new Drawing(renderer, "drawerDrawing")
        this.renderer = renderer;

        this.parentArray.push(new SelectItem('world', 'world'));
        for (let l of this.renderer.modelLabels) {
            this.parentArray.push(new SelectItem(l, l));
        }
        this.sceneArray.push(new SelectItem('Inside', 0));
        this.sceneArray.push(new SelectItem('Outside', 1));
        this.sceneArray.push(new SelectItem('Intro', 2));
    }

    setMouseData(mouseDown: boolean, mouseUp: boolean, ray: Ray) {


        if (mouseDown) {
            this.currentLine = new DrawLine()
            this.currentLine.drawSize = this.drawSize;
            this.lines.push(this.currentLine);

            this.isDrawing = true;
        }
        if (this.isDrawing) {

            ray.intersectPlaneLocal(this.drawing.getWorldPos(), new Vector3(0, 0, 1));
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
            this.drawing.progress = 1.0;
        } else {
            this.enabled = false
            //this.drawing.visible = false;
        }
        GameModel.lockView = UI.LBool("LockView", GameModel.lockView);
        UI.LFloatSlider(this.drawing, "progress", 0.0, 1.0)

        if (UI.LButton("Play")) {
            this.drawing.progress = 0.0;
            gsap.to(this.drawing, {progress: 1, duration: 2, ease: "power4.Out"})
        }

        this.sceneID = UI.LSelect("scene", this.sceneArray)
        let p = UI.LSelect("parent", this.parentArray)

        UI.LVector("offset", this.drawing.offset)
        UI.LColor("color", this.color);
        this.drawing.material.uniforms.setUniform('color', this.color)
        if (p != this.currentParent) {

            if (p == "world") {
                this.drawing.worldParent = null;
            } else {
                this.drawing.worldParent = this.renderer.modelByLabel[p];
            }
            this.currentParent = p;
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
        let name = UI.LTextInput("name", "name")
        if (UI.LButton("save")) {

            this.updateDrawing()

            saveToBinFile(this.dataArrSmall, name + "_" + this.currentParent)
        }
        UI.popWindow()
    }


    private updateDrawing() {
        let size = 0;
        let sizeS = 0;
        for (let l of this.lines) {
            size += l.points.length * 4;
            sizeS += l.points.length * 3;
        }
        this.dataArrSmall = new Int16Array(sizeS + 16)
        this.dataArrSmall[0] = this.sceneID;
        this.dataArrSmall[1] = Math.round(this.drawing.offset.x * 1000);
        this.dataArrSmall[2] = Math.round(this.drawing.offset.y * 1000);
        this.dataArrSmall[3] = Math.round(this.drawing.offset.z * 1000);

        this.dataArrSmall[4] = Math.round(this.color.x * 255);
        this.dataArrSmall[5] = Math.round(this.color.y * 255);
        this.dataArrSmall[6] = Math.round(this.color.z * 255);

        this.dataArr = new Float32Array(size);
        let pointCount = 0;


        let min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, 0)
        let max = new Vector3(Number.MIN_VALUE, Number.MIN_VALUE, 0)
        for (let l of this.lines) {

            for (let p of l.points) {
                let pos = pointCount * 4;
                let posS = pointCount * 3 + 16;
                this.dataArrSmall[posS++] = Math.round(p.x * 1000)
                this.dataArrSmall[posS++] = Math.round(p.y * 1000)
                this.dataArrSmall[posS++] = Math.round(l.drawSize * 1000)

                if (p.x < min.x) min.x = p.x;
                if (p.y < min.y) min.y = p.y;
                if (p.x > max.x) max.x = p.x;
                if (p.y > max.y) max.y = p.y;

                this.dataArr[pos++] = p.x;
                this.dataArr[pos++] = p.y;
                this.dataArr[pos++] = l.drawSize;
                this.dataArr[pos++] = 0.0;
                pointCount++;
            }


        }
        this.dataArrSmall[7] = Math.round(min.x * 1000);
        this.dataArrSmall[8] = Math.round(min.y * 1000);
        this.dataArrSmall[9] = Math.round(max.x * 1000);
        this.dataArrSmall[10] = Math.round(max.y * 1000);
        this.drawing.createBuffer(this.dataArr, "instanceBuffer")
        this.drawing.numDrawInstancesMax = pointCount;
        this.drawing.numDrawInstances = pointCount;
        this.pointCount = pointCount;

    }
}

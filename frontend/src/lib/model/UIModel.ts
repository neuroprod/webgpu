import Model from "./Model";
import Renderer from "../Renderer";
import {Vector2} from "math.gl";


export default class UIModel extends Model {
    mousePos = new Vector2()
    mouseEnabled = false;

    constructor(renderer: Renderer, label: string, keepAlive: boolean = true) {
        super(renderer, label, keepAlive);

    }

    onOver() {
        //console.log("over",this.label)
    }

    onOut() {
        //console.log("out",this.label)
    }

    onDown() {
        // console.log("onDown",this.label)
    }

    onUp() {
        //console.log("onUp",this.label)
    }

    onClick() {
        //console.log("onClick",this.label)
    }

    collectChildren(array: Array<Model>) {
        if (!this.visible) return;

        for (let i of this.children) {
            let a = i as UIModel;

            a.collectChildren(array)
        }
        if (this.mesh) {
            array.push(this);
        }
    }

    protected updateMatrices() {
        super.updateMatrices();
        if (this.mesh) {
            this.min.from(this.mesh.min)
            this.max.from(this.mesh.max)

        }

    }

    checkMouse(pos: Vector2) {

        if (!this.visible) return null;
        for (let i of this.children) {
            let a = i as UIModel;

            let result = a.checkMouse(pos);
            if (result) return result
        }
        if (!this.mouseEnabled) return null;
        this.mousePos.from(pos);
        this.mousePos.transform(this.worldMatrixInv)

        if (this.mousePos.x < this.min.x || this.mousePos.x > this.max.x) {
            return null
        }
        if (this.mousePos.y < this.min.y || this.mousePos.y > this.max.y) {
            return null
        }
        return this;

    }

}

import Renderer from "../Renderer";
import Material from "../core/Material";
import Mesh from "../core/Mesh";
import Object3D from "../core/Object3D";
import ModelTransform from "./ModelTransform";
import HitTestObject from "../meshes/HitTestObject";
import Ray from "../Ray";
import GameModel from "../../GameModel";


export default class Model extends Object3D {
    material!: Material;
    mesh!: Mesh

    public modelTransform: ModelTransform;
    public visible: boolean = true;
    public hitTestObject: HitTestObject;
    public canHitTest: boolean = false;

    constructor(renderer: Renderer, label: string) {
        super(renderer, label);
        this.modelTransform = new ModelTransform(renderer, label + "_transform")

        this.renderer.addModel(this);
    }

    public update() {
        if (!this._dirty) return;
        this.updateMatrices()

    }

    public checkHit(ray: Ray) {
        if(!this.visible) return false;
        if(this.hitTestObject.checkHit(ray, this.worldMatrixInv)){
            GameModel.hitObjectLabel =this.label;
            return true;
        }
        return false;
    }

    destroy() {
        if (this.parent) this.parent.removeChild(this);
    }

    protected updateMatrices() {
        super.updateMatrices();

        this.modelTransform.setWorldMatrix(this.worldMatrix);
    }
}

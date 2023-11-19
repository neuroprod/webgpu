import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import {Matrix4, Quaternion, Vector3} from "math.gl";

export default class Object3D extends ObjectGPU {
    public parent: Object3D | null = null
    public children: Array<Object3D> = []
    private tempMatrix = new Matrix4()
    protected _dirty: boolean = true;
    private _position = new Vector3(0, 0, 0);
    private _scale = new Vector3(1, 1, 1);
    private _rotation = new Quaternion(0, 0, 0, 1);

    constructor(renderer: Renderer, label: string = "") {
        super(renderer, label);
    }

    private _worldMatrix: Matrix4 = new Matrix4()

    public get worldMatrix() {
        if (!this._dirty) return this._worldMatrix;
        this.updateMatrices();
        return this._worldMatrix;

    }

    private _localMatrix: Matrix4 = new Matrix4()

    public get localMatrix() {
        if (!this._dirty) return this._localMatrix;
        this.updateMatrices();
        return this._localMatrix;

    }

    public setPosition(x: number, y: number, z: number) {
        this._position.set(x, y, z)
        this.setDirty();
    }

    public setScale(x: number, y: number, z: number) {
        this._scale.set(x, y, z)
        this.setDirty();
    }

    public setRotation(x: number, y: number, z: number, w: number) {
        this._rotation.set(x, y, z, w)
        this.setDirty();
    }

    public addChild(child: Object3D) {

        if (child.parent) child.parent.removeChild(child);
        this.children.push(child);
        child.parent = this;
        child.setDirty();
        // this._rotation.fromAxisRotation()
    }

    public removeChild(child: Object3D) {
        let index = this.children.indexOf(child);
        if (index < 0) return;
        child.parent = null;
        this.children.splice(index, 1);
    }

    protected updateMatrices() {
        if(!this._dirty )return

        this._localMatrix.identity();
        this._localMatrix.translate(this._position);

        this.tempMatrix.fromQuaternion(this._rotation);
        this._localMatrix.multiplyRight(this.tempMatrix);
        this._localMatrix.scale(this._scale);
        //update local matrix
        if (this.parent) {
            this._worldMatrix.copy(this.parent.worldMatrix)
            this._worldMatrix.multiplyRight(this._localMatrix);
        } else {
            this._worldMatrix.copy(this._localMatrix)
        }
        this._dirty = false;
    }

    private setDirty() {
        if (this._dirty) return;
        this._dirty = true;
        for (let c of this.children) {
            c.setDirty();
        }
    }


}

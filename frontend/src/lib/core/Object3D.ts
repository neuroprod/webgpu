import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import {Euler, Matrix4, Quaternion, Vector3, Vector4} from "math.gl";

export default class Object3D extends ObjectGPU {
    public parent: Object3D | null = null
    public children: Array<Object3D> = []
    private tempMatrix = new Matrix4()
    protected _dirty: boolean = true;
    protected _position = new Vector3(0, 0, 0);
    private _scale = new Vector3(1, 1, 1);
    private _rotation = new Quaternion(0, 0, 0, 1);
    public castShadow :boolean=true;
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

    public getWorldPos(localPos=new Vector3(0,0,0))
    {

        let temp =new Vector4(localPos.x,localPos.y,localPos.z,1)
        temp.applyMatrix4(this.worldMatrix);
        return new Vector3(temp.x,temp.y,temp.z);
    }

    public setPosition(x: number, y: number, z: number) {
        if(this._position.equals([x,y,z]))return
        this._position.set(x, y, z)
        this.setDirty();
    }

    public setScale(x: number, y: number, z: number) {
       if(this._scale.equals([x,y,z]))return
        this._scale.set(x, y, z)
        this.setDirty();
    }

    public setRotation(x: number, y: number, z: number, w: number) {

        if(this._rotation.equals([x,y,z]))return
        this._rotation.set(x, y, z, w)
        this.setDirty();
    }
    public setEuler(x: number, y: number, z: number) {
        this._rotation.identity()
        this._rotation.rotateZ(z).rotateY(y).rotateX(x);

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


    getScale() {
        return this._scale;
    }

    getRotation() {
        return this._rotation;
    }

    getPosition() {
        return this._position;
    }
}

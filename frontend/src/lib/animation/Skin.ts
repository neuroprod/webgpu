import Object3D from "../core/Object3D";
import {Matrix4} from "math.gl";

export default class Skin{
    private label: string;
    private objects: Array<Object3D>;
    private invBindMatrices: Array<Matrix4>;
    private dataArray:Float32Array
    constructor(label:string,objects:Array<Object3D>,invBindMatrices:Array<Matrix4>) {
        this.label =label;
        this.objects=objects;
        this.invBindMatrices =invBindMatrices;
        this.dataArray =new Float32Array(16*this.objects.length)
        this.update()
    }
    public update(){
        for(let i=0;i<this.objects.length;i++){
            let invMatrix =  this.invBindMatrices[i]
            let objMatrix =  this.objects[i].worldMatrix;

            let m = invMatrix.clone().multiplyRight(objMatrix);
            this.dataArray.set(m,16*i);
        }


    }
}

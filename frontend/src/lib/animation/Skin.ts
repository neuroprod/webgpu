import Object3D from "../core/Object3D";
import {Matrix4} from "math.gl";
import UniformGroup from "../core/UniformGroup";
import Renderer from "../Renderer";
import {ShaderType} from "../core/ShaderTypes";

export default class Skin extends UniformGroup{

    private objects: Array<Object3D>;
    private invBindMatrices: Array<Matrix4>;
    private dataArray:Float32Array
    constructor(renderer:Renderer,label:string,objects:Array<Object3D>,invBindMatrices:Array<Matrix4>) {
      super(renderer,label,"skin")
        this.renderer.skin = this;
        this.objects=objects;
        this.invBindMatrices =invBindMatrices;
        this.dataArray =new Float32Array(16*this.objects.length)
        this.addUniform("matrices",  this.dataArray,GPUShaderStage.VERTEX,ShaderType.mat4,this.objects.length)

        //console.log(this.getShaderText(4))
    }
    public updateData(){
       for(let i=0;i<this.objects.length;i++){
            let invMatrix =  this.invBindMatrices[i]
            let objMatrix =  this.objects[i].worldMatrix;

            let m = invMatrix.clone().multiplyLeft(objMatrix);
            this.dataArray.set(m,16*i);
        }
        this.setUniform("matrices", this.dataArray)

    }
}

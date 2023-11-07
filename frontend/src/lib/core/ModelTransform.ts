import UniformGroup from "./UniformGroup";
import Renderer from "../Renderer";
import {Matrix3, Matrix4} from "math.gl";

export default class ModelTransform extends UniformGroup{

    private modelMatrix: Matrix4 =new Matrix4();
    private normalMatrix: Matrix3=new Matrix3();
    private normalMatrixTemp: Matrix4=new Matrix4();
    public instance:ModelTransform;
    constructor(renderer:Renderer,label:string) {
        super(renderer,label,"model");
        this.addUniform("modelMatrix",this.modelMatrix)
        this.addUniform("normalMatrix",this.normalMatrix)
        if(!ModelTransform.instance)ModelTransform.instance=this;
    }
    static getShaderText(id: number): string {
        return ModelTransform.instance.getShaderText(id);
    }
    static getBindGroupLayout(){
        return ModelTransform.instance.bindGroupLayout
    }


    setWorldMatrix(worldMatrix: Matrix4) {

        this.modelMatrix.copy(worldMatrix);
        this.normalMatrixTemp.copy(worldMatrix);
        this.normalMatrixTemp.invert();
        this.normalMatrixTemp.transpose();


        this.setUniform("modelMatrix",this.modelMatrix)
        this.setUniform("normalMatrix",this.normalMatrixTemp)
    }
}

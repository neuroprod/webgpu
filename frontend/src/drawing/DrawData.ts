import UniformGroup from "../lib/core/UniformGroup";
import Renderer from "../lib/Renderer";
import {ShaderType} from "../lib/core/ShaderTypes";
import {Vector4} from "math.gl";


export default class DrawData extends UniformGroup{


    private dataArray:Float32Array
    private numInstances: number;
    constructor(renderer:Renderer,label:string,numInstances:number) {
        super(renderer,label,"drawData")
        this.numInstances =numInstances
        this.dataArray =new Float32Array(numInstances*4)
        this.addUniform("instanceData",  this.dataArray,GPUShaderStage.VERTEX,ShaderType.vec4,numInstances)

        //console.log(this.getShaderText(4))
    }
    public updateData(){
        for(let i=0;i<  this.numInstances;i++){
            let p =new Vector4(Math.random(),Math.random(),0.1,1)
            this.dataArray.set(p,4*i);
        }
        this.setUniform("instanceData", this.dataArray)

    }
}

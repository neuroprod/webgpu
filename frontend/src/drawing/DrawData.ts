import UniformGroup from "../lib/core/UniformGroup";
import Renderer from "../lib/Renderer";
import {ShaderType} from "../lib/core/ShaderTypes";


export default class DrawData extends UniformGroup {


    public dataArray: Float32Array
    private numInstances: number;
    public isDirty: boolean;

    constructor(renderer: Renderer, label: string, numInstances: number) {
        super(renderer, label, "drawData")
        this.numInstances = numInstances
        this.dataArray = new Float32Array(numInstances * 4)


        this.addUniform("instanceData", this.dataArray, GPUShaderStage.VERTEX, ShaderType.vec4, numInstances)
        this.isDirty = true;
        //console.log(this.getShaderText(4))
    }

    public updateData() {
        if (this.isDirty) this.setUniform("instanceData", this.dataArray)
        this.isDirty = false;
    }
}

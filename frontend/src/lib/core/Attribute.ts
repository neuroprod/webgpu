import {getFormatForShaderType, getShaderTextForShaderType, getSizeForShaderType,} from "./ShaderTypes";

export default class Attribute {
    public name: string;
    public type: string
    public slot = 0;
    format: GPUVertexFormat;
    arrayLength: number;
    size: number;
    stepMode: GPUVertexStepMode;

    constructor(name: string, type: string, arrayLength = 1, stepMode: GPUVertexStepMode) {
        this.name = name;
        this.type = type;
        this.stepMode = stepMode;
        this.arrayLength = arrayLength
        this.format = getFormatForShaderType(type);
        this.size = getSizeForShaderType(type, arrayLength)
    }

    getShaderText() {
        if (length == 1) {
            return "@location(" + this.slot + ") " + this.name + " : f32 ,";
        } else {
            return (
                "@location(" +
                this.slot +
                ") " +
                this.name +
                " :" + getShaderTextForShaderType(this.type, this.arrayLength) + ","
            );
        }
    }
}

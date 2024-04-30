import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import Attribute from "./Attribute";
import UniformGroup from "./UniformGroup";
import MathArray from "@math.gl/core/src/classes/base/math-array";
import Material from "./Material";
import Texture from "../textures/Texture";
import {AddressMode, FilterMode, TextureDimension} from "../WebGPUConstants";
import {ShaderType} from "./ShaderTypes";


export default class Shader extends ObjectGPU {

    attributes: Array<Attribute> = [];
    shader: GPUShaderModule;


    tempMaterial: Material


    public needsTransform: boolean = false;
    public needsCamera: boolean = false;
    public logShaderCode = false;

    constructor(renderer: Renderer, label = "") {
        super(renderer, label);

    }

    init() {
    }

    public addUniform(name: string, value: MathArray | number, usage: GPUShaderStageFlags = GPUShaderStage.FRAGMENT, format = ShaderType.auto, arraySize = 1) {
        if (!this.tempMaterial.uniforms) this.tempMaterial.uniforms = new UniformGroup(this.renderer, this.label, "uniforms")

        this.tempMaterial.uniforms.addUniform(name, value, usage, format, arraySize)

    }

    public addTexture(name: string, value: Texture, sampleType: GPUTextureSampleType = "float", dimension: GPUTextureViewDimension = TextureDimension.TwoD, usage: GPUShaderStageFlags = GPUShaderStage.FRAGMENT) {
        if (!this.tempMaterial.uniforms) this.tempMaterial.uniforms = new UniformGroup(this.renderer, this.label, "uniforms")
        this.tempMaterial.uniforms.addTexture(name, value, sampleType, dimension, usage);

    }

    public addSampler(name: string, usage = GPUShaderStage.FRAGMENT, addressMode = AddressMode.ClampToEdge, filterMode = FilterMode.Linear) {
        if (!this.tempMaterial.uniforms) this.tempMaterial.uniforms = new UniformGroup(this.renderer, this.label, "uniforms")
        this.tempMaterial.uniforms.addSampler(name, usage, filterMode, addressMode);

    }

    public addSamplerComparison(name: string) {
        if (!this.tempMaterial.uniforms) this.tempMaterial.uniforms = new UniformGroup(this.renderer, this.label, "uniforms")
        this.tempMaterial.uniforms.addSamplerComparison(name);

    }

    public addVertexOutput(name: string, length: number) {

    }

    public addAttribute(name: string, type: string, arrayLength = 1, stepMode: GPUVertexStepMode = "vertex") {
        let at = new Attribute(name, type, arrayLength, stepMode);
        at.slot = this.attributes.length;
        this.attributes.push(at);
    }

    public getShaderUniforms(index: number) {
        let a = ""
        if (this.tempMaterial.uniforms) {
            a = this.tempMaterial.uniforms.getShaderText(index)
        }

        return a;

    }

    public getShaderAttributes() {

        let a = "";
        for (let atr of this.attributes) {

            a += atr.getShaderText();
        }
        return a;
    }

    public getShader() {
        if (this.shader) return this.shader
        if (this.logShaderCode) {
            this.logShader();

        }

        this.shader = this.device.createShaderModule({
            label: "shader_" + this.label,
            code: this.getShaderCode(),
        });
        return this.shader
    }

    getVertexBufferLayout() {
        let bufferLayout: Array<GPUVertexBufferLayout> = [];


        for (let atr of this.attributes) {

            let vertexAtr: GPUVertexAttribute = {
                shaderLocation: atr.slot, offset: 0, format: atr.format,

            }

            bufferLayout.push({
                arrayStride: atr.size * 4,
                stepMode: atr.stepMode,
                attributes: [
                    vertexAtr,
                ],
            });
        }
        return bufferLayout;
    }

    protected getShaderCode(): string {
        return ``;
    }

    private logShader() {
        console.log("vvvv", this.label, "vvvvvvvvvvvvvvvvvvvvvvvvvvvv")
        let s = this.getShaderCode();
        let a = s.split("\n");
        let count = 1;
        let r = ""
        for (let l of a) {
            r += count + ": " + l + "\n";
            count++;
        }
        console.log(r);
        console.log("^^^^", this.label, "^^^^^^^^^^^^^^^^^^^^^^^^")

    }
}

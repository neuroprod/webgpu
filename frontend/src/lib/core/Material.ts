import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import Shader from "./Shader";
import RenderPass from "./RenderPass";
import {CompareFunction} from "../WebGPUConstants";
import UniformGroup from "./UniformGroup";
import ModelTransform from "../model/ModelTransform";
import Camera from "../Camera";
import Skin from "../animation/Skin";

export default class Material extends ObjectGPU {
    shader: Shader;
    pipeLine: GPURenderPipeline;
    public uniforms: UniformGroup;
    public depthWrite: boolean = true;
    public depthCompare: GPUCompareFunction = CompareFunction.Less;
    public blendModes: Array<GPUBlendState>;
    private pipeLineLayout: GPUPipelineLayout;
    private colorTargets: Array<GPUColorTargetState> = [];
    private depthStencilState: GPUDepthStencilState;
    private needsDepth: boolean = true;
    public skin: Skin
    public cullMode: "none" | "front" | "back" = "back";
    private extraGroup: UniformGroup;

    constructor(renderer: Renderer, label: string, shader: Shader) {
        super(renderer, label);
        this.shader = shader;
        this.shader.tempMaterial = this;
        this.shader.init();
        renderer.addMaterial(this);

    }

    makePipeLine(pass: RenderPass) {


        if (this.pipeLine) return;
        this.colorTargets = []
        let count = 0
        for (let a of pass.colorAttachments) {

            let s: GPUColorTargetState = {format: a.renderTexture.options.format}
            if (this.blendModes) {
                s.blend = this.blendModes[count];
            }
            count++
            this.colorTargets.push(s);
        }
        if (pass.depthStencilAttachment) {
            this.needsDepth = true;
            this.depthStencilState = {
                depthWriteEnabled: this.depthWrite,
                depthCompare: this.depthCompare,
                format: pass.depthStencilAttachment.renderTexture.options.format,
            }
        }
        this.makePipeLineLayout()


        this.pipeLine = this.device.createRenderPipeline(
            this.getPipeLineDescriptor(pass));

    }


    private getPipeLineDescriptor(pass: RenderPass): GPURenderPipelineDescriptor {


        let desc: GPURenderPipelineDescriptor = {
            label: "Material_pipeLine" + this.label,
            layout: this.pipeLineLayout,
            vertex: {
                module: this.shader.getShader(),
                entryPoint: "mainVertex",
                buffers: this.shader.getVertexBufferLayout(),
            },

            primitive: {
                topology: "triangle-list",
                cullMode: this.cullMode,
            },
            multisample: {
                count: pass.sampleCount,
            },
        };
        if (this.needsDepth) {
            desc.depthStencil = this.depthStencilState;
        }
        if (this.colorTargets.length) {
            desc.fragment = {
                module: this.shader.shader,
                entryPoint: "mainFragment",
                targets: this.colorTargets,
            }
        }
        return desc;
    }

    private makePipeLineLayout() {
        let layouts = []
        if (this.shader.needsCamera) layouts.push(Camera.getBindGroupLayout())
        if (this.shader.needsTransform) layouts.push(ModelTransform.getBindGroupLayout())
        if (this.uniforms) layouts.push(this.uniforms.bindGroupLayout)
        if (this.skin) layouts.push(this.skin.bindGroupLayout)
        if (this.extraGroup) layouts.push(this.extraGroup.bindGroupLayout)
        this.pipeLineLayout = this.device.createPipelineLayout({
            label: "Material_pipelineLayout_" + this.label,
            bindGroupLayouts: layouts,
        });
    }


    addUniformGroup(uniformGroup: UniformGroup) {
        this.extraGroup = uniformGroup;
    }
}

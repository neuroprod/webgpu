import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import Shader from "./Shader";
import RenderPass from "./RenderPass";
import {TextureFormat} from "../WebGPUConstants";
import UniformGroup from "./UniformGroup";
import ModelTransform from "./ModelTransform";
import Camera from "../Camera";

export default class Material extends ObjectGPU {
    shader: Shader;
    pipeLine: GPURenderPipeline;
    private pipeLineLayout: GPUPipelineLayout;
    private renderPass: RenderPass;
    private colorTargets:Array<GPUColorTargetState>=[];
    private needsDepth: boolean =true;
    public uniforms:UniformGroup;
    constructor(renderer: Renderer, label: string, shader: Shader) {
        super(renderer, label);
        this.shader = shader;
        this.shader.tempMaterial =this;
        this.shader.init();
        renderer.addMaterial(this);

    }

    makePipeLine() {


        if(this.pipeLine)return;
        this.colorTargets =[]
        this.colorTargets.push({ format:  TextureFormat.BGRA8Unorm as GPUTextureFormat });
        this.makePipeLineLayout()


        this.pipeLine = this.device.createRenderPipeline(
            this.getPipeLineDescriptor());

    }


    private getPipeLineDescriptor(): GPURenderPipelineDescriptor {


        let desc: GPURenderPipelineDescriptor = {
            label: "Material_pipeLine" + this.label,
            layout: this.pipeLineLayout,
            vertex: {
                module: this.shader.getShader(),
                entryPoint: "mainVertex",
                buffers: this.shader.getVertexBufferLayout(),
            },
            fragment: {
                module: this.shader.shader,
                entryPoint: "mainFragment",
                targets: this.colorTargets,
            },
            primitive: {
                topology: "triangle-list",
                cullMode: "back",
            },
            multisample: {
                count: 4,
            },
        };
        if (this.needsDepth) {
            desc.depthStencil = {
                depthWriteEnabled: true,
                depthCompare: "less",
                format: "depth24plus",
            };
        }
        return desc;
    }

    private makePipeLineLayout() {
        this.pipeLineLayout= this.device.createPipelineLayout({
            label: "Material_pipelineLayout_" + this.label,
            bindGroupLayouts: [Camera.getBindGroupLayout(),ModelTransform.getBindGroupLayout(),this.uniforms.bindGroupLayout],
        });
    }

    setRenderPass(renderPass: RenderPass) {
        this.renderPass =renderPass;
    }
}

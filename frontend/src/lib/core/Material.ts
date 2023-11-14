import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import Shader from "./Shader";
import RenderPass from "./RenderPass";
import {CompareFunction} from "../WebGPUConstants";
import UniformGroup from "./UniformGroup";
import ModelTransform from "../model/ModelTransform";
import Camera from "../Camera";

export default class Material extends ObjectGPU {
    shader: Shader;
    pipeLine: GPURenderPipeline;
    private pipeLineLayout: GPUPipelineLayout;

    private colorTargets:Array<GPUColorTargetState>=[];
    private depthStencilState:GPUDepthStencilState;
    private needsDepth: boolean =true;
    public uniforms:UniformGroup;
    public depthWrite: boolean =true;
    public depthCompare: GPUCompareFunction=CompareFunction.Less;

    constructor(renderer: Renderer, label: string, shader: Shader) {
        super(renderer, label);
        this.shader = shader;
        this.shader.tempMaterial =this;
        this.shader.init();
        renderer.addMaterial(this);

    }

    makePipeLine(pass:RenderPass) {


        if(this.pipeLine)return;
        this.colorTargets =[]

        for(let a of pass.colorAttachments){

            this.colorTargets.push({ format:  a.renderTexture.options.format });
        }
        if(pass.depthStencilAttachment){
            this.needsDepth =true;
            this.depthStencilState={
                depthWriteEnabled: this.depthWrite,
                depthCompare: this.depthCompare,
                format: pass.depthStencilAttachment.renderTexture.options.format,
            }
        }
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
            desc.depthStencil =this.depthStencilState;
        }
        return desc;
    }

    private makePipeLineLayout() {
        let layouts =[]
        if(this.shader.needsCamera)layouts.push(Camera.getBindGroupLayout())
        if(this.shader.needsTransform)layouts.push(ModelTransform.getBindGroupLayout())
        layouts.push(this.uniforms.bindGroupLayout)

        this.pipeLineLayout= this.device.createPipelineLayout({
            label: "Material_pipelineLayout_" + this.label,
            bindGroupLayouts: layouts,
        });
    }


}

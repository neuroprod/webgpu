export default class TextureBatchMaterial {
    private device: GPUDevice;
    private shader: GPUShaderModule;
    public pipeLine!: GPURenderPipeline;
    private pipelineLayout: GPUPipelineLayout;
    private presentationFormat: GPUTextureFormat;
    private needsDepth: boolean = true;

    constructor(
        device: GPUDevice,
        presentationFormat: GPUTextureFormat,
        mvpBindGroupLayout: GPUBindGroupLayout,
        textureBindGroupLayout: GPUBindGroupLayout
    ) {
        this.device = device;
        this.presentationFormat = presentationFormat;
        this.shader = this.device.createShaderModule({
            label: "UI_Shader_TextureBatchMaterial",
            code: this.getShader(),
        });
        this.pipelineLayout = this.device.createPipelineLayout({
            label: "UI_PipelineLayout_TextureBatchMaterial",
            bindGroupLayouts: [mvpBindGroupLayout, textureBindGroupLayout],
        });
    }

    makePipeline(needsDepth: boolean) {
        if (this.pipeLine && this.needsDepth == needsDepth) return;

        this.needsDepth = needsDepth;

        let desc: GPURenderPipelineDescriptor = {
            label: "UI_Pipeline_TextureBatchMaterial",
            layout: this.pipelineLayout,
            vertex: {
                module: this.shader,
                entryPoint: "mainVertex",
                buffers: [
                    {
                        arrayStride: 8,
                        attributes: [
                            {
                                // position
                                shaderLocation: 0,
                                offset: 0,
                                format: "float32x2",
                            }

                        ],
                    },
                ],
            },
            fragment: {
                module: this.shader,
                entryPoint: "mainFragment",
                targets: [
                    {
                        format: this.presentationFormat,
                        blend: {
                            color: {
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha",
                                operation: "add",
                            },
                            alpha: {
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha",
                                operation: "add",
                            },
                        },
                    },
                ],
            },
            primitive: {
                topology: "triangle-list",
            },

            multisample: {
                count: 4,
            },
        };
        if (needsDepth) {
            desc.depthStencil = {
                depthWriteEnabled: false,
                depthCompare: "always",

                format: "depth16unorm",
            };
        }
        this.pipeLine = this.device.createRenderPipeline(desc);
    }

    getShader() {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput{
    @builtin(position) position : vec4f,
     @location(0) uv : vec2f,

}

@group(0) @binding(0) var<uniform> mvp :  mat4x4 <f32>;
struct Uniforms
 {
    rect : vec4 <f32>,

 }
 @group(1) @binding(0)  var<uniform> uniforms : Uniforms ;
@group(1) @binding(1) var colorTexture: texture_2d<f32>;
@group(1) @binding(2) var mySampler: sampler;

@vertex
fn mainVertex( 
    @location(0) position : vec2f,
 
) -> VertexOutput
{
    var output : VertexOutput;
    output.position = mvp*vec4( position*uniforms.rect.zw +uniforms.rect.xy,0.0,1.0);
    output.uv =position;


    return output;
}


@fragment
fn mainFragment(
    @location(0) uv: vec2f,
  
) -> @location(0) vec4f
{

   var text= textureSample(colorTexture, mySampler,  uv);
     


    let c  =text;
     return c;
}
///////////////////////////////////////////////////////////
`;
    }
}

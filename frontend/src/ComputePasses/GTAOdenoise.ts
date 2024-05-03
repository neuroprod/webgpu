import Renderer from "../lib/Renderer";
import UniformGroup from "../lib/core/UniformGroup";
import Texture from "../lib/textures/Texture";
import {FilterMode, TextureDimension, TextureFormat} from "../lib/WebGPUConstants";
import RenderTexture from "../lib/textures/RenderTexture";

export default class GTAOdenoise {
    private renderer: Renderer;
    private passEncoder: GPUComputePassEncoder;
    private computePipeline: GPUComputePipeline;


    private uniformGroup: UniformGroup;
    private texture: Texture;
    private pipeLineLayout: GPUPipelineLayout;


    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.uniformGroup = new UniformGroup(this.renderer, "GTAOdenoise", "test")


        this.texture = new RenderTexture(renderer, "GTAOdenoise", {
            usage: GPUTextureUsage.COPY_DST |
                GPUTextureUsage.STORAGE_BINDING |
                GPUTextureUsage.TEXTURE_BINDING,
            scaleToCanvas: true,
            sizeMultiplier:1,

            format: TextureFormat.R32Float,
        })


        this.uniformGroup.addTexture("ambient_occlusion_noisy", this.renderer.texturesByLabel["GTAO"], "float", TextureDimension.TwoD, GPUShaderStage.COMPUTE)

        this.uniformGroup.addTexture("depth_differences", this.renderer.texturesByLabel["GTAODepth"], "uint", TextureDimension.TwoD, GPUShaderStage.COMPUTE)
        this.uniformGroup.addStorageTexture("ambient_occlusion", this.texture, TextureFormat.R32Float);

        this.uniformGroup.addSampler("point_clamp_sampler", GPUShaderStage.COMPUTE, FilterMode.Linear)

    }


    public add() {

        let descriptor: GPUComputePassDescriptor = {}
        this.passEncoder = this.renderer.commandEncoder.beginComputePass(
            descriptor
        );
        this.passEncoder.setPipeline(this.getPipeLine());
        this.passEncoder.setBindGroup(0, this.uniformGroup.bindGroup);

        this.passEncoder.dispatchWorkgroups(Math.ceil(this.texture.options.width / 8), Math.ceil(this.texture.options.height / 8), 1);

        this.passEncoder.end();
    }

    getPipeLine() {
        if (this.computePipeline) return this.computePipeline
        this.pipeLineLayout = this.renderer.device.createPipelineLayout({
            label: "Compute_pipelineLayout_",
            bindGroupLayouts: [this.uniformGroup.bindGroupLayout],
        });

        let shaderCode = this.getShaderCode()

        // if( this.computePipeline)return  this.computePipeline;
        this.computePipeline = this.renderer.device.createComputePipeline({
            layout: this.pipeLineLayout,
            compute: {
                module: this.renderer.device.createShaderModule({
                    code: shaderCode,
                }),
                entryPoint: 'main',
            },
        });
        return this.computePipeline;


    }

    private getShaderCode() {
        return /* wgsl */ `



@group(0) @binding(0) var ambient_occlusion_noisy: texture_2d<f32>;
@group(0) @binding(1) var depth_differences: texture_2d<u32>;
@group(0) @binding(2) var ambient_occlusion: texture_storage_2d<r32float, write>;
@group(0) @binding(3) var point_clamp_sampler: sampler;


 @compute
@workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let pixel_coordinates = vec2<i32>(global_id.xy);
    let textureSize =vec2<f32>( textureDimensions(ambient_occlusion_noisy));
    let uv = vec2<f32>(pixel_coordinates) / textureSize;

    let edges0 = textureGather(0, depth_differences, point_clamp_sampler, uv);
    let edges1 = textureGather(0, depth_differences, point_clamp_sampler, uv, vec2<i32>(2i, 0i));
    let edges2 = textureGather(0, depth_differences, point_clamp_sampler, uv, vec2<i32>(1i, 2i));
    let visibility0 = textureGather(0, ambient_occlusion_noisy, point_clamp_sampler, uv);
    let visibility1 = textureGather(0, ambient_occlusion_noisy, point_clamp_sampler, uv, vec2<i32>(2i, 0i));
    let visibility2 = textureGather(0, ambient_occlusion_noisy, point_clamp_sampler, uv, vec2<i32>(0i, 2i));
    let visibility3 = textureGather(0, ambient_occlusion_noisy, point_clamp_sampler, uv, vec2<i32>(2i, 2i));

    let left_edges = unpack4x8unorm(edges0.x);
    let right_edges = unpack4x8unorm(edges1.x);
    let top_edges = unpack4x8unorm(edges0.z);
    let bottom_edges = unpack4x8unorm(edges2.w);
    var center_edges = unpack4x8unorm(edges0.y);
    center_edges *= vec4<f32>(left_edges.y, right_edges.x, top_edges.w, bottom_edges.z);

    let center_weight = 1.2;
    let left_weight = center_edges.x;
    let right_weight = center_edges.y;
    let top_weight = center_edges.z;
    let bottom_weight = center_edges.w;
    let top_left_weight = 0.425 * (top_weight * top_edges.x + left_weight * left_edges.z);
    let top_right_weight = 0.425 * (top_weight * top_edges.y + right_weight * right_edges.z);
    let bottom_left_weight = 0.425 * (bottom_weight * bottom_edges.x + left_weight * left_edges.w);
    let bottom_right_weight = 0.425 * (bottom_weight * bottom_edges.y + right_weight * right_edges.w);

    let center_visibility = visibility0.y;
    let left_visibility = visibility0.x;
    let right_visibility = visibility0.z;
    let top_visibility = visibility1.x;
    let bottom_visibility = visibility2.z;
    let top_left_visibility = visibility0.w;
    let top_right_visibility = visibility1.w;
    let bottom_left_visibility = visibility2.w;
    let bottom_right_visibility = visibility3.w;

    var sum = center_visibility;
    sum += left_visibility * left_weight;
    sum += right_visibility * right_weight;
    sum += top_visibility * top_weight;
    sum += bottom_visibility * bottom_weight;
    sum += top_left_visibility * top_left_weight;
    sum += top_right_visibility * top_right_weight;
    sum += bottom_left_visibility * bottom_left_weight;
    sum += bottom_right_visibility * bottom_right_weight;

    var sum_weight = center_weight;
    sum_weight += left_weight;
    sum_weight += right_weight;
    sum_weight += top_weight;
    sum_weight += bottom_weight;
    sum_weight += top_left_weight;
    sum_weight += top_right_weight;
    sum_weight += bottom_left_weight;
    sum_weight += bottom_right_weight;

    let denoised_visibility = sum / sum_weight;

    textureStore(ambient_occlusion, pixel_coordinates, vec4<f32>(denoised_visibility, 0.0, 0.0, 0.0));
 }
`;
    }
}

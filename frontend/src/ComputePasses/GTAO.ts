import Renderer from "../lib/Renderer";
import UniformGroup from "../lib/core/UniformGroup";
import Texture from "../lib/textures/Texture";
import {FilterMode, TextureDimension, TextureFormat} from "../lib/WebGPUConstants";
import RenderTexture from "../lib/textures/RenderTexture";
import Camera from "../lib/Camera";
import DefaultTextures from "../lib/textures/DefaultTextures";
import {Vector4} from "math.gl";
import MathArray from "@math.gl/core/src/classes/base/math-array";

export default class GTAO {
    private renderer: Renderer;
    private passEncoder: GPUComputePassEncoder;
    private computePipeline: GPUComputePipeline;


    public uniformGroup: UniformGroup;
    private texture: Texture;
    private pipeLineLayout: GPUPipelineLayout;
    private textureDepth: RenderTexture;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.uniformGroup = new UniformGroup(this.renderer, "GTAO", "uniforms")


        this.texture = new RenderTexture(renderer, "GTAO", {
            usage: GPUTextureUsage.COPY_DST |
                GPUTextureUsage.STORAGE_BINDING |
                GPUTextureUsage.TEXTURE_BINDING,
            scaleToCanvas: true,
            sizeMultiplier: 1,

            format: TextureFormat.R32Float,
        })
        this.textureDepth = new RenderTexture(renderer, "GTAODepth", {
            usage: GPUTextureUsage.COPY_DST |
                GPUTextureUsage.STORAGE_BINDING |
                GPUTextureUsage.TEXTURE_BINDING,
            scaleToCanvas: true,
            sizeMultiplier: 1,

            format: TextureFormat.R32Uint,
        })

        this.uniformGroup.addUniform("aoSettings", new Vector4(2, 3, 1, 0) as MathArray);
        this.uniformGroup.addTexture("noise", DefaultTextures.getMagicNoise(this.renderer), "float", TextureDimension.TwoD, GPUShaderStage.COMPUTE)
        //  this.uniformGroup.addTexture("noise",renderer.texturesByLabel["BlueNoise.png"],"float", TextureDimension.TwoD, GPUShaderStage.COMPUTE)
        this.uniformGroup.addTexture("preprocessed_depth", this.renderer.texturesByLabel["AOPreprocessedDepth"], "float", TextureDimension.TwoD, GPUShaderStage.COMPUTE)
        this.uniformGroup.addTexture("normals", this.renderer.texturesByLabel["GNormal"], "float", TextureDimension.TwoD, GPUShaderStage.COMPUTE)
        this.uniformGroup.addStorageTexture("ambient_occlusion", this.texture, TextureFormat.R32Float);
        this.uniformGroup.addStorageTexture("depth_differences", this.textureDepth, TextureFormat.R32Uint);
        this.uniformGroup.addSampler("point_clamp_sampler", GPUShaderStage.COMPUTE, FilterMode.Linear)

    }


    public add() {

        let descriptor: GPUComputePassDescriptor = {}
        this.passEncoder = this.renderer.commandEncoder.beginComputePass(
            descriptor
        );
        this.passEncoder.setPipeline(this.getPipeLine());
        this.passEncoder.setBindGroup(0, this.uniformGroup.bindGroup);
        this.passEncoder.setBindGroup(1, this.renderer.camera.bindGroup)
        this.passEncoder.dispatchWorkgroups(Math.ceil(this.texture.options.width / 8), Math.ceil(this.texture.options.height / 8), 1);

        this.passEncoder.end();
    }

    getPipeLine() {
        if (this.computePipeline) return this.computePipeline
        this.pipeLineLayout = this.renderer.device.createPipelineLayout({
            label: "Compute_pipelineLayout_",
            bindGroupLayouts: [this.uniformGroup.bindGroupLayout, this.renderer.camera.bindGroupLayout],
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

struct Uniforms
{
    aoSettings : vec4 <f32>,
}
@group(0) @binding(0)  var<uniform> uniforms : Uniforms ;

@group(0) @binding(1) var noise: texture_2d<f32>;
@group(0) @binding(2) var preprocessed_depth: texture_2d<f32>;
@group(0) @binding(3) var normals: texture_2d<f32>;
@group(0) @binding(4) var ambient_occlusion: texture_storage_2d<r32float, write>;
@group(0) @binding(5) var depth_differences: texture_storage_2d<r32uint, write>;
@group(0) @binding(6) var point_clamp_sampler: sampler;

${Camera.getShaderText(1)}


fn load_noise(pixel_coordinates: vec2<i32>) -> vec2<f32> {
 var index = textureLoad(noise, pixel_coordinates%3 , 0).rg*2.0-1.0;

return  normalize(index);
    // R2 sequence - http://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences
    //return fract(0.5 + index * vec2<f32>(0.75487766624669276005, 0.5698402909980532659114));
}

// Calculate differences in depth between neighbor pixels (later used by the spatial denoiser pass to preserve object edges)
fn calculate_neighboring_depth_differences_(pixel_coordinates: vec2<i32>,textureSize :vec2<f32>) -> f32 {
    // Sample the pixel's depth and 4 depths around it
    let uv = vec2<f32>(pixel_coordinates) / textureSize;
    let depths_upper_left = textureGather(0, preprocessed_depth, point_clamp_sampler, uv);
    let depths_bottom_right = textureGather(0, preprocessed_depth, point_clamp_sampler, uv, vec2<i32>(1i, 1i));
    let depth_center = depths_upper_left.y;
    let depth_left = depths_upper_left.x;
    let depth_top = depths_upper_left.z;
    let depth_bottom = depths_bottom_right.x;
    let depth_right = depths_bottom_right.z;

    // Calculate the depth differences (large differences represent object edges)
    var edge_info = vec4<f32>(depth_left, depth_right, depth_top, depth_bottom) - depth_center;
    let slope_left_right = (edge_info.y - edge_info.x) * 0.5;
    let slope_top_bottom = (edge_info.w - edge_info.z) * 0.5;
    let edge_info_slope_adjusted = edge_info + vec4<f32>(slope_left_right, -slope_left_right, slope_top_bottom, -slope_top_bottom);
    edge_info = min(abs(edge_info), abs(edge_info_slope_adjusted));
    let bias = 0.25; // Using the bias and then saturating nudges the values a bit
    let scale = depth_center * 0.011; // Weight the edges by their distance from the camera
    edge_info = saturate((1.0 + bias) - edge_info / scale); // Apply the bias and scale, and invert edge_info so that small values become large, and vice versa

    // Pack the edge info into the texture
    let edge_info_packed = vec4<u32>(pack4x8unorm(edge_info), 0u, 0u, 0u);
    textureStore(depth_differences, pixel_coordinates, edge_info_packed);

    return depth_center;
}
fn calculate_neighboring_depth_differences(pixel_coordinates: vec2<i32>, textureSize :vec2<f32>) -> f32 {
    // Sample the pixel's depth and 4 depths around it
    let uv = vec2<f32>(pixel_coordinates) / textureSize;
    let depths_upper_left = textureGather(0, preprocessed_depth, point_clamp_sampler, uv);
    let depths_bottom_right = textureGather(0, preprocessed_depth, point_clamp_sampler, uv, vec2<i32>(1i, 1i));
    let depth_center = depths_upper_left.y;
    let depth_left = depths_upper_left.x;
    let depth_top = depths_upper_left.z;
    let depth_bottom = depths_bottom_right.x;
    let depth_right = depths_bottom_right.z;

    // Calculate the depth differences (large differences represent object edges)
    var edge_info = vec4<f32>(depth_left, depth_right, depth_top, depth_bottom) - depth_center;
    let slope_left_right = (edge_info.y - edge_info.x) * 0.5;
    let slope_top_bottom = (edge_info.w - edge_info.z) * 0.5;
    let edge_info_slope_adjusted = edge_info + vec4<f32>(slope_left_right, -slope_left_right, slope_top_bottom, -slope_top_bottom);
    edge_info = min(abs(edge_info), abs(edge_info_slope_adjusted));
   let bias = 0.25; // Using the bias and then saturating nudges the values a bit
    let scale = depth_center ; // Weight the edges by their distance from the camera
    edge_info = saturate((1.0 + bias) - edge_info / scale); // Apply the bias and scale, and invert edge_info so that small values become large, and vice versa

    // Pack the edge info into the texture
    let edge_info_packed = vec4<u32>(pack4x8unorm(edge_info), 0u, 0u, 0u);
   textureStore(depth_differences, pixel_coordinates, edge_info_packed);

    return depth_center;
}

fn load_normal_view_space(uv: vec2<f32>) -> vec3<f32> {
    var world_normal = textureSampleLevel(normals, point_clamp_sampler, uv, 0.0).xyz;
    world_normal = (world_normal * 2.0) - 1.0;
    let inverse_view = mat3x3<f32>(
        camera.inverseViewMatrix[0].xyz,
       camera.inverseViewMatrix[1].xyz,
        camera.inverseViewMatrix[2].xyz,
    );
    return inverse_view * world_normal;
}

fn reconstruct_view_space_position(depth: f32, uv: vec2<f32>) -> vec3<f32> {
    let clip_xy = vec2<f32>(uv.x * 2.0 - 1.0, 1.0 - 2.0 * uv.y);
    let t = camera.inverseProjectionMatrix * vec4<f32>(clip_xy, depth, 1.0);
    let view_xyz = t.xyz / t.w;
    return view_xyz;
}

fn load_and_reconstruct_view_space_position(uv: vec2<f32>, sample_mip_level: f32) -> vec3<f32> {
    let depth = textureSampleLevel(preprocessed_depth, point_clamp_sampler, uv, sample_mip_level).r;
    return reconstruct_view_space_position(depth, uv);
}
const PI=3.1415927;
const HALF_PI=1.5707964;
fn gtao_multibounce(visibility: f32, base_color: vec3<f32>) -> vec3<f32> {
    let a = 2.0404 * base_color - 0.3324;
    let b = -4.7951 * base_color + 0.6417;
    let c = 2.7552 * base_color + 0.6903;
    let x = vec3<f32>(visibility);
    return max(x, ((x * a + b) * x + c) * x);
}

fn fast_sqrt(x: f32) -> f32 {
    return bitcast<f32>(0x1fbd1df5 + (bitcast<i32>(x) >> 1u));
}

fn fast_acos(in_x: f32) -> f32 {
    let x = abs(in_x);
    var res = -0.156583 * x + HALF_PI;
    res *= fast_sqrt(1.0 - x);
    return select(PI - res, res, in_x >= 0.0);
}

@compute
@workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {

    let slice_count = uniforms.aoSettings.x;
    let samples_per_slice_side =uniforms.aoSettings.y;
    let effect_radius = uniforms.aoSettings.z * 1.457;
    let falloff_range = 0.615 * effect_radius;
    let falloff_from = effect_radius * (1.0 - 0.615);
    let falloff_mul = -1.0 / falloff_range;
    let falloff_add = falloff_from / falloff_range + 1.0;

    let pixel_coordinates = vec2<i32>(global_id.xy);
        let textureSize =vec2<f32>( textureDimensions(normals));
    let uv = (vec2<f32>(pixel_coordinates) + 0.5) /textureSize;

    var pixel_depth = calculate_neighboring_depth_differences(pixel_coordinates,textureSize);
    pixel_depth += 0.00001; // Avoid depth precision issues

    let pixel_position = reconstruct_view_space_position(pixel_depth, uv);
    let pixel_normal = load_normal_view_space(uv);
    let view_vec = normalize(-pixel_position);

    let noise = load_noise(pixel_coordinates);
    let sample_scale = (-0.5 * effect_radius * camera.projectionMatrix[0][0]) / pixel_position.z;

    var visibility = 0.0;
    for (var slice_t = 0.0; slice_t < slice_count; slice_t += 1.0) {
        let slice = slice_t + noise.x;
        let phi = (PI / slice_count) * slice;
        let omega = vec2<f32>(cos(phi), sin(phi));

        let direction = vec3<f32>(omega.xy, 0.0);
        let orthographic_direction = direction - (dot(direction, view_vec) * view_vec);
        let axis = cross(direction, view_vec);
        let projected_normal = pixel_normal - axis * dot(pixel_normal, axis);
        let projected_normal_length = length(projected_normal);

        let sign_norm = sign(dot(orthographic_direction, projected_normal));
        let cos_norm = saturate(dot(projected_normal, view_vec) / projected_normal_length);
        let n = sign_norm * fast_acos(cos_norm);

        let min_cos_horizon_1 = cos(n + HALF_PI);
        let min_cos_horizon_2 = cos(n - HALF_PI);
        var cos_horizon_1 = min_cos_horizon_1;
        var cos_horizon_2 = min_cos_horizon_2;
        let sample_mul = vec2<f32>(omega.x, -omega.y) * sample_scale;
        for (var sample_t = 0.0; sample_t < samples_per_slice_side; sample_t += 1.0) {
            var sample_noise = (slice_t + sample_t * samples_per_slice_side) * 0.6180339887498948482;
            sample_noise = fract(noise.y + sample_noise);

            var s = (sample_t + sample_noise) / samples_per_slice_side;
            s *= s; // https://github.com/GameTechDev/XeGTAO#sample-distribution
            let sample = s * sample_mul;

            let sample_mip_level = clamp(log2(length(sample)) - 3.3, 0.0, 3.0); // https://github.com/GameTechDev/XeGTAO#memory-bandwidth-bottleneck
            let sample_position_1 = load_and_reconstruct_view_space_position(uv + sample, sample_mip_level);
            let sample_position_2 = load_and_reconstruct_view_space_position(uv - sample, sample_mip_level);

            let sample_difference_1 = sample_position_1 - pixel_position;
            let sample_difference_2 = sample_position_2 - pixel_position;
            let sample_distance_1 = length(sample_difference_1);
            let sample_distance_2 = length(sample_difference_2);
            var sample_cos_horizon_1 = dot(sample_difference_1 / sample_distance_1, view_vec);
            var sample_cos_horizon_2 = dot(sample_difference_2 / sample_distance_2, view_vec);

            let weight_1 = saturate(sample_distance_1 * falloff_mul + falloff_add);
            let weight_2 = saturate(sample_distance_2 * falloff_mul + falloff_add);
            sample_cos_horizon_1 = mix(min_cos_horizon_1, sample_cos_horizon_1, weight_1);
            sample_cos_horizon_2 = mix(min_cos_horizon_2, sample_cos_horizon_2, weight_2);

            cos_horizon_1 = max(cos_horizon_1, sample_cos_horizon_1);
            cos_horizon_2 = max(cos_horizon_2, sample_cos_horizon_2);
        }

        let horizon_1 = fast_acos(cos_horizon_1);
        let horizon_2 = -fast_acos(cos_horizon_2);
        let v1 = (cos_norm + 2.0 * horizon_1 * sin(n) - cos(2.0 * horizon_1 - n)) / 4.0;
        let v2 = (cos_norm + 2.0 * horizon_2 * sin(n) - cos(2.0 * horizon_2 - n)) / 4.0;
        visibility += projected_normal_length * (v1 + v2);
    }
    visibility /= slice_count;
    visibility = clamp(visibility, 0.03, 1.0);

    textureStore(ambient_occlusion, pixel_coordinates, vec4<f32>(pow(visibility,uniforms.aoSettings.w), 0.0, 0.0, 0.0));
}
 
`;
    }
}

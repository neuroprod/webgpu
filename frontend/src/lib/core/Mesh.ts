import ObjectGPU from "./ObjectGPU";
import Renderer from "../Renderer";
import {IndexFormat} from "../WebGPUConstants";

import HitTestObject from "../meshes/HitTestObject";
import {Vector3} from "math.gl";

export default class Mesh extends ObjectGPU {

    public numVertices: GPUSize32;

    public indexBuffer: GPUBuffer;
    public numIndices: GPUSize32;
    public hasIndices: boolean = false;

    public hitTestObject:HitTestObject;


    private buffers: Array<GPUBuffer> = [];
    private bufferMap: Map<string, GPUBuffer> = new Map<string, GPUBuffer>();
    indexFormat: GPUIndexFormat;
    min =new Vector3(-100000,-100000,-100000);
    max =new Vector3(100000,100000,100000);
    constructor(renderer:Renderer,label="") {
        super(renderer,label);


    }

    setVertices(vertices: Float32Array) {
        this.numVertices = vertices.length;
        this.createBuffer(vertices, "aPos");
    }

    setNormals(normals: Float32Array) {
        this.createBuffer(normals, "aNormal");
    }
    setTangents(tangents: Float32Array) {
        this.createBuffer(tangents, "aTangent");
    }
    setColor0(colors: Float32Array) {
        this.createBuffer(colors, "aColor");
    }
    setUV0(uv0: Float32Array) {
        this.createBuffer(uv0, "aUV0");
    }
    setWeights(weights: Float32Array) {
        this.createBuffer(weights, "aWeights");
    }
    setJoints(data:Uint32Array) {
        this.createBufferI(data, "aJoints");
    }
    createBufferI(data:Uint32Array, name: string) {

        const buffer = this.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,

        });
        const dst = new Uint32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "vertexBuffer_" + this.label + "_" + name;

        this.buffers.push(buffer);
        this.bufferMap.set(name, buffer);
    }
    createBuffer(data: Float32Array, name: string) {

        const buffer = this.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "vertexBuffer_" + this.label + "_" + name;

        this.buffers.push(buffer);
        this.bufferMap.set(name, buffer);
    }

    setIndices(indices: Uint16Array) {
        this.indexFormat =IndexFormat.Uint16
        this.hasIndices = true;
        this.numIndices = indices.length;
        let byteLength=Math.ceil(indices.byteLength/4)*4;

        this.indexBuffer = this.device.createBuffer({
            size: byteLength,
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true,
        });

        const dst = new Uint16Array(this.indexBuffer.getMappedRange());
        dst.set(indices);

        this.indexBuffer.unmap();
        this.indexBuffer.label = "indexBuffer_" + this.label;
    }
    setIndices32(indices: Uint32Array) {
        this.indexFormat =IndexFormat.Uint32
        this.hasIndices = true;
        this.numIndices = indices.length;

        this.indexBuffer = this.device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true,
        });

        const dst = new Uint32Array(this.indexBuffer.getMappedRange());
        dst.set(indices);

        this.indexBuffer.unmap();
        this.indexBuffer.label = "indexBuffer_" + this.label;
    }
    destroy() {
        if (this.indexBuffer) this.indexBuffer.destroy();
    }

    getBufferByName(name: string) {

        return this.bufferMap.get(name);
    }


}

import Renderer from "../lib/Renderer";
import Model from "../lib/model/Model";
import Plane from "../lib/meshes/Plane";
import GBufferShaderLeaves from "../shaders/GBufferShaderLeaves";
import Material from "../lib/core/Material";
import Timer from "../lib/Timer";
import {Vector3} from "math.gl";

export default class Leaves {
    public model: Model;
    private renderer: Renderer;


    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.model = new Model(renderer, "leaves")
        this.model.mesh = new Plane(renderer, 1, 1, 1, 1, false)
        this.model.material = new Material(renderer, "leaves", new GBufferShaderLeaves(renderer, "leaves"));
        this.model.material.cullMode = "none"
        this.model.numInstances = 20
        this.model.setPosition(-16, -2, 2)
        this.makePositions();

        this.makeRotations()


    }

    update() {
        this.model.material.uniforms.setUniform("time", Timer.time)
    }

    private makeRotations() {
        let data = new Float32Array(this.model.numInstances * 4)
        let index = 0;
        for (let i = 0; i < this.model.numInstances; i++) {

            let r = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
            r.normalize();

            data[index++] = r.x;
            data[index++] = r.y;
            data[index++] = r.z;
            data[index++] = (Math.random() * 0.2 + 0.8) * 0.15;

        }


        let buffer = this.renderer.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "instanceBuffer_" + "leavesRot";
        this.model.addBuffer("instanceRot", buffer)
    }

    private makePositions() {
        let data = new Float32Array(this.model.numInstances * 4)
        let index = 0;
        for (let i = 0; i < this.model.numInstances; i++) {


            data[index++] = (Math.random() - 0.5) * 7;
            data[index++] = (Math.random() - 0.5) * 6;
            data[index++] = -Math.random() * 7 - 1;
            data[index++] = Math.random() * 0.5 + 0.5;

        }


        let buffer = this.renderer.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "instanceBuffer_" + "leaves";
        this.model.addBuffer("instancePos", buffer)
    }
}

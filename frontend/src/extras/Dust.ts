import Renderer from "../lib/Renderer";
import Model from "../lib/model/Model";
import Plane from "../lib/meshes/Plane";
import Material from "../lib/core/Material";
import Timer from "../lib/Timer";
import DustShader from "../shaders/DustShader";
import {BlendFactor, BlendOperation} from "../lib/WebGPUConstants";

export default class Dust {
    public model: Model;
    private renderer: Renderer;


    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.model = new Model(renderer, "dust")
        this.model.mesh = new Plane(renderer, 1, 1, 1, 1, false)
        this.model.material = new Material(renderer, "leaves", new DustShader(renderer, "dust"));

        this.model.material.depthWrite = false;
        this.model.material.cullMode = "none"
        this.model.numInstances = 50
        let l: GPUBlendState = {

            color: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            },
            alpha: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            }
        }
        // this.model.material.blendModes=[l];


        this.model.setPosition(0, 0, 0)
        this.makePositions();


    }

    update() {

        this.model.material.uniforms.setUniform("time", Timer.time * 0.03)
    }

    private makePositions() {
        let data = new Float32Array(this.model.numInstances * 4)
        let index = 0;
        for (let i = 0; i < this.model.numInstances; i++) {


            data[index++] = (Math.random() - 0.5) * 10;
            data[index++] = (Math.random() - 0.5) * 3;
            data[index++] = -Math.random() * 3;
            data[index++] = (Math.random() * 0.7 + 0.3) * 0.03;

        }


        let buffer = this.renderer.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "instanceBuffer_" + "dust";
        this.model.addBuffer("instancePos", buffer)
    }
}

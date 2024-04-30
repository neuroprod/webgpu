import Renderer from "../lib/Renderer";
import Model from "../lib/model/Model";
import Plane from "../lib/meshes/Plane";
import Material from "../lib/core/Material";
import ParticlesGoldShader from "./ParticlesGoldShader";

import {BlendFactor, BlendOperation} from "../lib/WebGPUConstants";
import Timer from "../lib/Timer";
import gsap from "gsap";

export default class ParticlesGold {
    private renderer: Renderer;
    public model: Model
    public fade = 1

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.model = new Model(renderer, "particlesGold")
        this.model.mesh = new Plane(this.renderer)
        this.model.material = new Material(renderer, "partGoldMat", new ParticlesGoldShader(renderer, "partGoldShader"))
        this.model.material.depthWrite = true
        this.model.numInstances = 100;
        this.model.setEuler(Math.PI / 2, 0, 0)
        this.model.visible = false;
        let data = new Float32Array(this.model.numInstances * 4)
        let index = 0;
        for (let i = 0; i < this.model.numInstances; i++) {


            data[index++] = Math.random();
            data[index++] = Math.random() * Math.PI * 2;
            data[index++] = Math.random() + 0.5 * 3.0;
            data[index++] = Math.random() * 0.2;

        }


        let buffer = this.renderer.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "instanceBuffer_" + "";


        this.model.addBuffer("instanceData", buffer)

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
        this.model.material.blendModes = [l]
    }

    update() {
        if (!this.model.visible) return;
        this.model.material.uniforms.setUniform("time", Timer.time)
        this.model.material.uniforms.setUniform("fade", this.fade);
        //  this.model.material.uniforms.setUniform("color",GameModel.tempC);
        //this.model.material.uniforms.setUniform("sett",GameModel.temp1);
        this.model.setPosition(-25.10, -0.125, -2.05)
        //  this.model.setEuler(Math.random()*6,Math.random()*6,Math.random()*6)
    }

    show(delay: number) {
        // setTimeout(()=>{
        this.model.visible = true
        gsap.to(this, {fade: 0, duration: 1, delay: 0.0});
        //},delay*1000)
    }
}

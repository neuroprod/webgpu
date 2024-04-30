import Model from "../lib/model/Model";
import Renderer from "../lib/Renderer";
import DrawData from "./DrawData";
import Material from "../lib/core/Material";
import DrawShader from "../shaders/DrawShader";
import Quad from "../lib/meshes/Quad";
import Object3D from "../lib/core/Object3D";
import {NumericArray, Vector3} from "math.gl";
import ColorV from "../lib/ColorV";
import gsap from "gsap";


export default class Drawing extends Model {
    public drawData: DrawData;

    public numDrawInstances: number = 1;
    public numDrawInstancesMax: number;
    public firstDrawInstances: number = 0;
    worldParent: Object3D;
    progress: number = 0
    start: number = 0;
    offset = new Vector3();
    position = new Vector3();
    public sceneID: number = -1;
    protected color: ColorV = new ColorV(1, 1, 1, 1)
    private buffer: GPUBuffer;
    private tl: gsap.core.Timeline;
    private isShowing: boolean = false;

    constructor(renderer: Renderer, label: string, numInstances: number = 0) {
        super(renderer, label);

        this.numInstances = numInstances
        this.numDrawInstances = numInstances
        this.numDrawInstancesMax = numInstances;

        let shader = new DrawShader(this.renderer, "drawShader");
        shader.numInstances = this.numInstances;
        this.material = new Material(this.renderer, label, shader)


        this.mesh = new Quad(this.renderer);
    }

    update() {
        if (this.visible) {

            let target = this.offset.clone();

            if (this.worldParent) {
                target.add(this.worldParent.getWorldPos() as NumericArray)

            }
            this.position.lerp(target as NumericArray, 0.5)
            this.setPosition(this.position.x, this.position.y, this.position.z);
        }

        this.firstDrawInstances = Math.floor(this.start * this.numDrawInstancesMax);
        this.numDrawInstances = Math.floor(this.progress * this.numDrawInstancesMax) - this.firstDrawInstances;
        super.update()
    }

    createBuffer(data: Float32Array, name: string) {

        if (this.buffer) this.buffer.destroy();

        this.buffer = this.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(this.buffer.getMappedRange());
        dst.set(data);

        this.buffer.unmap();
        this.buffer.label = "vertexBuffer_" + this.label + "_" + name;


    }

    getBufferByName(name: string) {
        return this.buffer;
    }

    resolveParent() {


        let a = this.label.split("_");
        a.shift();
        let sa = a.join("_")
        let parent = sa.split(".")[0];

        if (parent == "world") return;
        this.worldParent = this.renderer.modelByLabel[parent];
    }

    show() {
        if (this.isShowing) return;
        if (this.tl) this.tl.clear();
        this.tl = gsap.timeline();
        if (this.start == 0 && this.progress == 1) {
            return;
        }
        this.isShowing = true;
        this.start = 0;
        this.progress = 0;
        this.tl.to(this, {progress: 1, ease: "power2.inOut", duration: 2.0}, 0);
        this.tl.set(this, {isShowing: false}, 1.0)
    }

    showIntro() {
        if (this.isShowing) return;
        if (this.tl) this.tl.clear();
        this.tl = gsap.timeline();
        if (this.start == 0 && this.progress == 1) {
            return;
        }
        this.isShowing = true;
        this.start = 0;
        this.progress = 0;
        this.tl.to(this, {progress: 1, ease: "power1.inOut", duration: 3.0}, 2);
        this.tl.set(this, {isShowing: false}, 4.0)
    }

    hideDelay(delay: number) {

        if (!this.tl) return;
        if (this.tl && this.tl.isActive()) {
            delay += this.tl.duration() - this.tl.time();

        } else {
            if (this.tl) this.tl.clear();
            this.tl = gsap.timeline();
        }

        this.tl.to(this, {start: 0.5, progress: 0.5, ease: "power2.in", duration: 0.1}, delay);

    }

    hideLoad() {
        if (this.tl) this.tl.clear();
        this.tl = gsap.timeline({});


        this.tl.to(this, {start: 1, ease: "power2.Out", duration: 0.5}, 0);
    }

    showLoad() {
        if (this.isShowing) return;
        if (this.tl) this.tl.clear();
        this.tl = gsap.timeline({repeat: -1, delay: 4});
        if (this.start == 0 && this.progress == 1) {
            return;
        }
        this.isShowing = true;
        this.start = 0;
        this.progress = 0;
        this.tl.to(this, {progress: 1, ease: "power2.Out", duration: 0.8}, 0);
        this.tl.to(this, {start: 1, ease: "power2.Out", duration: 1.9}, 1);

    }
}

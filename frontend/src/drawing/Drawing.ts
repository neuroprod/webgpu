import Model from "../lib/model/Model";
import Renderer from "../lib/Renderer";
import DrawData from "./DrawData";
import Material from "../lib/core/Material";
import DrawShader from "../shaders/DrawShader";
import Quad from "../lib/meshes/Quad";
import Object3D from "../lib/core/Object3D";
import {Vector3} from "math.gl";

export default class Drawing extends Model{
    public drawData: DrawData;
   public numInstances: number;
    public numDrawInstances: number;
    public numDrawInstancesMax: number;
    private buffer: GPUBuffer;
    worldParent: Object3D;
    progress:number =1
    offset =new Vector3();
    position=new Vector3();
    constructor(renderer:Renderer,label:string,data:any=null,numInstances:number=0) {
        super(renderer,label);
        this.numInstances =numInstances
        this.numDrawInstances=numInstances
        this.numDrawInstancesMax=numInstances;

        let shader =new DrawShader(this.renderer,"drawShader");
        shader.numInstances =this.numInstances;
        this.material =new Material(this.renderer,label,shader)
        this.material.depthWrite =false

        this.material.blendModes=[{
            color: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
            },
            alpha: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
            },
        }]

        this.mesh =new Quad(this.renderer);
    }
    update(){
        if(this.visible) {

            let target  =this.offset.clone();

            if (this.worldParent) {
                target.add (this.worldParent.getWorldPos())

            }
            this.position.lerp(target,0.1)
            this.setPosition(this.position.x,this.position.y,this.position.z);
        }
        this.numDrawInstances =Math.floor(this.progress*this.numDrawInstancesMax)
        super.update()
    }

    createBuffer(data: Float32Array, name: string) {

        if(this.buffer)this.buffer.destroy();

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
}
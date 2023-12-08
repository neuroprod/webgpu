import Model from "../lib/model/Model";
import Renderer from "../lib/Renderer";
import DrawData from "./DrawData";
import Material from "../lib/core/Material";
import DrawShader from "../shaders/DrawShader";
import Quad from "../lib/meshes/Quad";

export default class Drawing extends Model{
    public drawData: DrawData;
   public numInstances: number;
    public numDrawInstances: number;

    constructor(renderer:Renderer,label:string) {
        super(renderer,label);
        this.numInstances =100
        this.numDrawInstances=100
        this.drawData =new DrawData(renderer,label,this.numInstances);
        let shader =new DrawShader(this.renderer,"drawShader");
        shader.numInstances =this.numInstances;
        this.material =new Material(this.renderer,label,shader)
        this.material.addUniformGroup(this.drawData)
        this.mesh =new Quad(this.renderer);
    }




}

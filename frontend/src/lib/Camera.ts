import UniformGroup from "./core/UniformGroup";
import Renderer from "./Renderer";
import {Matrix4, Vector3} from "math.gl";

export default class Camera extends UniformGroup
{
    private view: Matrix4 = new Matrix4();
    private projection: Matrix4 = new Matrix4();
    private viewProjection: Matrix4 = new Matrix4();
    private viewProjectionInv!: Matrix4;


    public cameraWorld: Vector3 = new Vector3(0, 1.5, 3);
    public cameraLookAt: Vector3 = new Vector3(0, 1.5, 0);
    public cameraUp: Vector3 = new Vector3(0, 1, 0);

public static instance:Camera;
    constructor(renderer:Renderer,label:string) {
        super(renderer,label,"camera");
        this.addUniform("viewProjectionMatrix",this.viewProjection)
        if(!Camera.instance)Camera.instance=this;
    }
    static getShaderText(id: number): string {
        return Camera.instance.getShaderText(id);
    }
    static getBindGroupLayout(){
        return Camera.instance.bindGroupLayout
    }
    static getUniform(id: number): string {
        return Camera.instance.getShaderText(id);
    }
    protected updateData()
   {
        this.projection.perspective({
            fovy: 1,
            aspect: this.renderer.ratio,
            near: 0.1,
            far: 50,
        });

        this.view.lookAt({
            eye: this.cameraWorld,
            center: this.cameraLookAt,
            up: this.cameraUp,
        });
        this.viewProjection.identity();
        this.viewProjection.multiplyRight(this.projection);
        this.viewProjection.multiplyRight(this.view);

        this.viewProjectionInv =this.viewProjection.clone();
        this.viewProjectionInv.invert();


        this.setUniform("viewProjectionMatrix",this.viewProjection)
    }


}

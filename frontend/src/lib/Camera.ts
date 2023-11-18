import UniformGroup from "./core/UniformGroup";
import Renderer from "./Renderer";
import {lerp, Matrix4, Vector2, Vector3, Vector4} from "math.gl";

export default class Camera extends UniformGroup {
    public static instance: Camera;
    public cameraWorld: Vector3 = new Vector3(1, 1.5, 5);
    public cameraWorldU: Vector4 = new Vector4(1, 1.5, 5,1.0);
    public cameraLookAt: Vector3 = new Vector3(0, 1.5, 0);
    public cameraUp: Vector3 = new Vector3(0, 1, 0);
    public fovy = 0.9
    public near =2;
    public far = 20
    public lensShift = new Vector2(1, 0)
    private view: Matrix4 = new Matrix4();
    private projection: Matrix4 = new Matrix4();
    private viewProjection: Matrix4 = new Matrix4();
    private viewProjectionInv!: Matrix4;

    constructor(renderer: Renderer, label: string) {
        super(renderer, label, "camera");
        this.addUniform("viewProjectionMatrix", this.viewProjection)
        this.addUniform("inverseViewProjectionMatrix", this.viewProjection)
        this.addUniform("worldPosition", this.cameraWorldU)
        if (!Camera.instance) Camera.instance = this;
    }

    static getShaderText(id: number): string {
        return Camera.instance.getShaderText(id);
    }

    static getBindGroupLayout() {
        return Camera.instance.bindGroupLayout
    }

    static getUniform(id: number): string {
        return Camera.instance.getShaderText(id);
    }

    setProjection() {


        let frustumTop = this.near * Math.tan(this.fovy / 2);
        let frustumBottom = -frustumTop;
        let frustumRight = frustumTop * this.renderer.ratio;
        let frustumLeft = -frustumRight;


        if (this.lensShift.y != 0.0) {
            frustumTop = lerp(0.0, 2.0 * frustumTop, 0.5 + 0.5 * this.lensShift.y);
            frustumBottom = lerp(2.0 * frustumBottom, 0.0, 0.5 + 0.5 * this.lensShift.y);
        }

        if (this.lensShift.x != 0.0) {
            frustumRight = lerp(2.0 * frustumRight, 0.0, 0.5 - 0.5 * this.lensShift.x);
            frustumLeft = lerp(0.0, 2.0 * frustumLeft, 0.5 - 0.5 * this.lensShift.x);
        }


        this.projection[0] = 2.0 * this.near / (frustumRight - frustumLeft);
        this.projection[4] = 0.0;
        this.projection[8] = (frustumRight + frustumLeft) / (frustumRight - frustumLeft);
        this.projection[12] = 0.0;

        this.projection[1] = 0.0;
        this.projection[5] = 2.0 * this.near / (frustumTop - frustumBottom);
        this.projection[9] = (frustumTop + frustumBottom) / (frustumTop - frustumBottom);
        this.projection[13] = 0.0;

        this.projection[2] = 0.0;
        this.projection[6] = 0.0;
        this.projection[10] = -(this.far + this.near) / (this.far - this.near);
        this.projection[14] = -2.0 * this.far * this.near / (this.far - this.near);

        this.projection[3] = 0.0;
        this.projection[7] = 0.0;
        this.projection[11] = -1.0;
        this.projection[15] = 0.0;



        /*
        mat4 &m = mInverseProjectionMatrix;
        m[0][0] =  ( frustumRight - frustumLeft ) / ( 2.0 * this.near  );
        m[1][0] =  0.0;
        m[2][0] =  0.0;
        m[3][0] =  ( frustumRight + frustumLeft ) / ( 2.0 * this.near  );

        m[0][1] =  0.0;
        m[1][1] =  ( frustumTop - frustumBottom ) / ( 2.0 * this.near  );
        m[2][1] =  0.0;
        m[3][1] =  ( frustumTop + frustumBottom ) / ( 2.0 * this.near  );

        m[0][2] =  0.0;
        m[1][2] =  0.0;
        m[2][2] =  0.0;
        m[3][2] = -1.0;

        m[0][3] =  0.0;
        m[1][3] =  0.0;
        m[2][3] = -( this.far - this.near  ) / ( 2.0 * this.far*this.near  );
        m[3][3] =  ( this.far + this.near  ) / ( 2.0 * this.far*this.near  );*/
    }

    protected updateData() {
        /* this.projection.perspective({
              fovy: this.fovy,
              aspect: this.renderer.ratio,
              near: this.near,
              far: this.far,
          });*/


        this.setProjection();
        this.view.lookAt({
            eye: this.cameraWorld,
            center: this.cameraLookAt,
            up: this.cameraUp,
        });
        this.viewProjection.identity();
        this.viewProjection.multiplyRight(this.projection);
        this.viewProjection.multiplyRight(this.view);

        this.viewProjectionInv = this.viewProjection.clone();
        this.viewProjectionInv.invert();

        this.setUniform("inverseViewProjectionMatrix", this.viewProjectionInv)
        this.setUniform("viewProjectionMatrix", this.viewProjection)
        this.cameraWorldU.set(this.cameraWorld.x,this.cameraWorld.y,this.cameraWorld.z,1)
        this.setUniform("worldPosition", this.cameraWorldU)
    }
}

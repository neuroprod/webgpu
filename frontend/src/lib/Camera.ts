import UniformGroup from "./core/UniformGroup";
import Renderer from "./Renderer";
import {lerp, Matrix4, Vector2, Vector3, Vector4} from "math.gl";
import UI from "./UI/UI";
import Model from "./model/Model";
import GameModel from "../../public/GameModel";

export default class Camera extends UniformGroup {
    public static instance: Camera;
    public cameraWorld: Vector3 = new Vector3(1, 1.5, 5);
    public cameraWorldU: Vector4 = new Vector4(1, 1.5, 5, 1.0);
    public cameraLookAt: Vector3 = new Vector3(0, 1.5, 0);
    public cameraUp: Vector3 = new Vector3(0, 1, 0);
    public fovy = 0.9
    public near = 2;
    public far = 100;
    public ratio = 1
    public lensShift = new Vector2(0, 0)
    public viewProjectionInv = new Matrix4();
    public viewInv: Matrix4 = new Matrix4();
    public projectionInv: Matrix4 = new Matrix4();
    public perspective: boolean = true;
    public orthoLeft: number = -10;
    public orthoRight: number = 10;
    public orthoTop: number = 10;
    public orthoBottom: number = -10;
    private view: Matrix4 = new Matrix4();
    private projection: Matrix4 = new Matrix4();
    viewProjection: Matrix4 = new Matrix4();
    private fplanes: Array<Vector4> = []

    constructor(renderer: Renderer, label: string) {
        super(renderer, label, "camera");

        this.addUniform("viewProjectionMatrix", this.viewProjection)
        this.addUniform("inverseViewProjectionMatrix", this.viewProjection)
        this.addUniform("inverseViewMatrix", this.viewInv)
        this.addUniform("inverseProjectionMatrix", this.projectionInv)
        this.addUniform("projectionMatrix", this.projection)
        this.addUniform("worldPosition", this.cameraWorldU)


        for (let i = 0; i < 6; i++) {
            this.fplanes.push(new Vector4())
        }

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


        let fustrumTop = this.near * Math.tan(this.fovy / 2);
        let fustrumBottom = -fustrumTop;

        let fustrumRight = fustrumTop * this.ratio;
        let fustrumLeft = -fustrumRight;


        if (this.lensShift.y != 0.0) {
            fustrumTop = lerp(0.0, 2.0 * fustrumTop, 0.5 + 0.5 * this.lensShift.y);
            fustrumBottom = lerp(2.0 * fustrumBottom, 0.0, 0.5 + 0.5 * this.lensShift.y);
        }

        if (this.lensShift.x != 0.0) {
            fustrumRight = lerp(2.0 * fustrumRight, 0.0, 0.5 - 0.5 * this.lensShift.x);
            fustrumLeft = lerp(0.0, 2.0 * fustrumLeft, 0.5 - 0.5 * this.lensShift.x);
        }


        const dx = (fustrumRight - fustrumLeft);
        const dy = (fustrumTop - fustrumBottom);
        const dz = (this.near - this.far);

        this.projection[0] = 2.0 * this.near / dx;
        this.projection[1] = 0.0;
        this.projection[2] = 0.0;
        this.projection[3] = 0.0;

        this.projection[4] = 0.0;
        this.projection[5] = 2.0 * this.near / dy;
        this.projection[6] = 0.0;
        this.projection[7] = 0.0;

        this.projection[8] = (fustrumRight + fustrumLeft) / dx;
        this.projection[9] = (fustrumTop + fustrumBottom) / dy;
        this.projection[10] = this.far / dz;
        this.projection[11] = -1.0;

        this.projection[12] = 0.0;
        this.projection[13] = 0.0;
        this.projection[14] = this.far * this.near / dz;
        this.projection[15] = 0.0;


    }

    onUI() {
        UI.LFloat(this, 'orthoLeft')
        UI.LFloat(this, 'orthoRight')
        UI.LFloat(this, 'orthoBottom')
        UI.LFloat(this, 'orthoTop')
        UI.LFloat(this, 'near')
        UI.LFloat(this, 'far')
    }

    public modelInFrustum(model: Model): boolean {
        if (!GameModel.frustumCull) return true;
        for (let i: number = 0; i < 6; i++) {
            if (this.dot(this.fplanes[i], model.center.x, model.center.y, model.center.z) < -model.radius) {

                return false;
            }
        }
        return true;
    }

    private dot(plane: Vector4, x: number, y: number, z: number) {
        return plane.x * x + plane.y * y + plane.z * z + plane.w;
    }

    protected updateData() {

        if (this.perspective) {
            this.setProjection();
        } else {

            this.projection.ortho({
                left: this.orthoLeft,
                right: this.orthoRight,
                bottom: this.orthoBottom,
                top: this.orthoTop,
                near: this.near,
                far: this.far,
            })
        }

        this.view.lookAt({
            eye: this.cameraWorld,
            center: this.cameraLookAt,
            up: this.cameraUp,
        });
        this.viewInv.from(this.view);
        this.viewInv.invert();

        this.projectionInv.from(this.projection);
        this.projectionInv.invert();


        this.viewProjection.identity();
        this.viewProjection.multiplyRight(this.projection);
        this.viewProjection.multiplyRight(this.view);

        this.makeFrustum();

        this.viewProjectionInv.from(this.viewProjection);
        this.viewProjectionInv.invert();

        this.setUniform("inverseViewProjectionMatrix", this.viewProjectionInv)
        this.setUniform("viewProjectionMatrix", this.viewProjection)
        this.cameraWorldU.set(this.cameraWorld.x, this.cameraWorld.y, this.cameraWorld.z, 1)
        this.setUniform("worldPosition", this.cameraWorldU)
        this.setUniform("inverseViewMatrix", this.viewInv)
        this.setUniform("inverseProjectionMatrix", this.projectionInv)
        this.setUniform("projectionMatrix", this.projection)
    }

    private makeFrustum() {

        this.fplanes[0].set(this.viewProjection[3] - this.viewProjection[0], this.viewProjection[7] - this.viewProjection[4], this.viewProjection[11] - this.viewProjection[8], this.viewProjection[15] - this.viewProjection[12]);
        this.fplanes[1].set(this.viewProjection[3] + this.viewProjection[0], this.viewProjection[7] + this.viewProjection[4], this.viewProjection[11] + this.viewProjection[8], this.viewProjection[15] + this.viewProjection[12]);
        this.fplanes[2].set(this.viewProjection[3] + this.viewProjection[1], this.viewProjection[7] + this.viewProjection[5], this.viewProjection[11] + this.viewProjection[9], this.viewProjection[15] + this.viewProjection[13]);
        this.fplanes[3].set(this.viewProjection[3] - this.viewProjection[1], this.viewProjection[7] - this.viewProjection[5], this.viewProjection[11] - this.viewProjection[9], this.viewProjection[15] - this.viewProjection[13]);
        this.fplanes[4].set(this.viewProjection[3] - this.viewProjection[2], this.viewProjection[7] - this.viewProjection[6], this.viewProjection[11] - this.viewProjection[10], this.viewProjection[15] - this.viewProjection[14]);
        this.fplanes[5].set(this.viewProjection[3] + this.viewProjection[2], this.viewProjection[7] + this.viewProjection[6], this.viewProjection[11] + this.viewProjection[10], this.viewProjection[15] + this.viewProjection[14]);

        for (let p of this.fplanes) {
            p.scale(1 / Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2));
        }
    }
}

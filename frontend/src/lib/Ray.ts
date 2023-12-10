import {Matrix4, Vector2, Vector3, Vector4} from "math.gl";
import Camera from "./Camera";
import Renderer from "./Renderer";

export default class Ray {
    public hit: boolean = false;
    public hitPos: Vector3 = new Vector3();
    private renderer: Renderer;
    private rayStart: Vector3 = new Vector3();
    private rayDir: Vector3 = new Vector3();

    constructor(renderer: Renderer) {
        this.renderer = renderer;

    }

    clone() {
        let r = new Ray(this.renderer)
        r.rayStart = this.rayStart;
        r.rayDir = this.rayDir;
        return r;
    }

    setFromCamera(camera: Camera, mousePosIn: Vector2) {
        let mousePos = mousePosIn.clone().scale(new Vector2(2 / (this.renderer.width / this.renderer.pixelRatio), 2 / (this.renderer.height / this.renderer.pixelRatio)))
        let pos = new Vector4(mousePos.x - 1, (mousePos.y - 1) * -1, 1, 1);

        pos.transform(camera.viewProjectionInv);
        this.rayStart = camera.cameraWorld.clone()
        this.rayDir = new Vector3(pos.x - this.rayStart.x, pos.y - this.rayStart.y, pos.z - this.rayStart.z).normalize()

    }

    intersectPlane(position: Vector3, normal: Vector3) {

        let denom = normal.dot(this.rayDir);
        if (Math.abs(denom) > 0.0001) // your favorite epsilon
        {

            let t = (position.clone().subtract(this.rayStart)).dot(normal) / denom;
            if (t < 0) {
                this.hit = false;
                return;
            } else {
                this.hit = true;
                this.rayDir.clone().scale(t);
                this.hitPos = this.rayStart.clone().add(this.rayDir.clone().scale(t)).subtract(position);
            }

        } else {
            this.hit = false;
        }

    }

    intersectsBox(min: Vector3, max: Vector3) {

        const t1 = (min.x - this.rayStart.x) / this.rayDir.x;
        const t2 = (max.x - this.rayStart.x) / this.rayDir.x;
        const t3 = (min.y - this.rayStart.y) / this.rayDir.y;
        const t4 = (max.y - this.rayStart.y) / this.rayDir.y;
        const t5 = (min.z - this.rayStart.z) / this.rayDir.z;
        const t6 = (max.z - this.rayStart.z) / this.rayDir.z;

        const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
        const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

        if (tmax < 0) return false;
        if (tmin > tmax) return false;
        return true;
    }

    transform(invModel: Matrix4) {

        this.rayDir.add(this.rayStart);
        this.rayDir.transform(invModel);
        this.rayStart.transform(invModel);
        this.rayDir.subtract(this.rayStart);

    }
}

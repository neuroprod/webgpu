import {Matrix4, Vector2, Vector3, Vector4} from "math.gl";
import Camera from "./Camera";
import Renderer from "./Renderer";

export class HitTriangle {
    public normal: Vector3;

    public edge0: Vector3;
    public edge1: Vector3;
    public edge2: Vector3;
    public p0: Vector3;
    public p1: Vector3;
    public p2: Vector3;

    constructor(p0: Vector3, p1: Vector3, p2: Vector3) {


        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;

        let v0v1 = p1.clone().subtract(p0);
        let v0v2 = p2.clone().subtract(p0);

        // no need to normalize
        this.normal = v0v1.cross(v0v2);
        this.normal.normalize()


        this.edge0 = p1.clone().subtract(p0);
        this.edge1 = p2.clone().subtract(p1);
        this.edge2 = p0.clone().subtract(p2);

    }

}

export default class Ray {
    public hit: boolean = false;

    private renderer: Renderer;
    private rayStart: Vector3 = new Vector3();
    private rayDir: Vector3 = new Vector3();
    public hitDistance: number = -1;
    public hitPos: Vector3 = new Vector3();
    public hitNormal: Vector3 = new Vector3();

    constructor(renderer: Renderer) {
        this.renderer = renderer;

    }

    clone() {
        let r = new Ray(this.renderer)
        r.rayStart.from(this.rayStart);
        r.rayDir.from(this.rayDir);
        return r;
    }

    setFromCamera(camera: Camera, mousePosIn: Vector2) {

        let mousePos = mousePosIn.clone().scale(new Vector2(2 / (this.renderer.width / this.renderer.pixelRatio), 2 / (this.renderer.height / this.renderer.pixelRatio)))
        let pos = new Vector4(mousePos.x - 1, (mousePos.y - 1) * -1, 1, 1);

        pos.transform(camera.viewProjectionInv);
        this.rayStart = camera.cameraWorld.clone()
        this.rayDir = new Vector3(pos.x - this.rayStart.x, pos.y - this.rayStart.y, pos.z - this.rayStart.z).normalize()

    }

    tempPos = new Vector3()


    intersectPlaneLocal(position: Vector3, normal: Vector3) {

        let denom = normal.dot(this.rayDir);
        if (Math.abs(denom) > 0.0001) // your favorite epsilon
        {
            this.tempPos.from(position)
            let t = (this.tempPos.subtract(this.rayStart)).dot(normal) / denom;
            if (t < 0) {
                this.hit = false;
                return;
            } else {
                this.hit = true;
                this.hitDistance = t;

                this.hitPos.from(this.rayDir)
                this.hitPos.scale(t);
                this.hitPos.add(this.rayStart)
                this.hitPos.subtract(position);
                return;
            }

        }

    }


    intersectPlane(position: Vector3, normal: Vector3) {


        let denom = normal.dot(this.rayDir);
        if (Math.abs(denom) > 0.0001) // your favorite epsilon
        {
            this.tempPos.from(position)
            let t = (this.tempPos.subtract(this.rayStart)).dot(normal) / denom;
            if (t < 0) {
                this.hit = false;
                return;
            } else {
                this.hit = true;
                this.hitDistance = t;
                this.hitPos.from(this.rayDir)
                this.hitPos.scale(t);
                this.hitPos.add(this.rayStart)

                return;
            }

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

    tempVP = new Vector3()
    tempC = new Vector3()

    intersectHitTriangel(tri: HitTriangle) {
        this.hit = false;
        this.intersectPlane(tri.p0, tri.normal);
        if (!this.hit) {
            return false;
        }
        this.tempVP.from(this.hitPos);
        this.tempVP.subtract(tri.p0)
        //let vp0 = this.hitPos.clone().subtract(tri.p0);
        this.tempC.from(tri.edge0).cross(this.tempVP)
        // let C = tri.edge0.clone().cross(vp0);
        if (tri.normal.dot(this.tempC) < 0) {
            return false
        }

        this.tempVP.from(this.hitPos);
        this.tempVP.subtract(tri.p1)
        this.tempC.from(tri.edge1).cross(this.tempVP)
        // let vp1 = this.hitPos.clone().subtract(tri.p1);
        // C = tri.edge1.clone().cross(vp1);
        if (tri.normal.dot(this.tempC) < 0) {
            return false
        }
        this.tempVP.from(this.hitPos);
        this.tempVP.subtract(tri.p2)

        this.tempC.from(tri.edge2).cross(this.tempVP)
        //let vp2 = this.hitPos.clone().subtract(tri.p2);
        // C = tri.edge2.clone().cross(vp2);
        if (tri.normal.dot(this.tempC) < 0) {
            return false
        }
        this.hitNormal = tri.normal.clone();
        return true;
    }
}

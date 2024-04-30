import {Matrix4, Vector3} from "math.gl";
import Ray, {HitTriangle} from "../Ray";

export default class HitTestObject {

    public min: Vector3;
    public max: Vector3;
    private label: string;
    private hitTrangles: Array<HitTriangle> = [];
    public distance = 0
    public localPos: Vector3
    public hit = false;
    public localNormal: Vector3;

    constructor(label: string) {
        this.label = label;

    }

    checkHit(ray: Ray, invModel: Matrix4) {

        this.hit = false
        let rayT = ray.clone();
        rayT.transform(invModel);
        if (!rayT.intersectsBox(this.min, this.max)) {

            return false;

        }
        this.distance = Number.MAX_VALUE;

        for (let tri of this.hitTrangles) {
            if (rayT.intersectHitTriangel(tri)) {

                if (rayT.hitDistance < this.distance) {
                    this.distance = rayT.hitDistance;
                    this.localPos = rayT.hitPos.clone();
                    this.localNormal = rayT.hitNormal.clone();
                    this.hit = true;
                }


            }
        }

        return this.hit;

    }

    setTriangles(indices: Uint16Array, floatPos: Float32Array) {


        for (let i = 0; i < indices.length; i += 3) {

            let i1 = indices[i] * 3;
            let i2 = indices[i + 1] * 3;
            let i3 = indices[i + 2] * 3;

            let p1 = new Vector3(floatPos.slice(i1, i1 + 3));
            let p2 = new Vector3(floatPos.slice(i2, i2 + 3));
            let p3 = new Vector3(floatPos.slice(i3, i3 + 3));
            let hitTriangle = new HitTriangle(p1, p2, p3);
            this.hitTrangles.push(hitTriangle);

        }


    }
}

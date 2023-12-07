import {Matrix4, Vector3} from "math.gl";
import Ray from "../Ray";

export default class HitTestObject{

    public min:Vector3;
    public max:Vector3;
    constructor() {


    }
    checkHit(ray:Ray,invModel:Matrix4){
/*
        const t2 = (this.max.x - this.ro.x) / this.rd.x;
        const t3 = (min.y - this.ro.y) / this.rd.y;
        const t4 = (max.y - this.ro.y) / this.rd.y;
        const t5 = (min.z - this.ro.z) / this.rd.z;
        const t6 = (max.z - this.ro.z) / this.rd.z;

        const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
        const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

        if (tmax < 0) return false;
        if (tmin > tmax) return false;*/

    }
}

import {Matrix4, Vector3} from "math.gl";
import Ray from "../Ray";

export default class HitTestObject{

    public min:Vector3;
    public max:Vector3;
    constructor() {


    }
    checkHit(ray:Ray,invModel:Matrix4){

        let rayT = ray.clone();
        rayT.transform(invModel);
        if(rayT.intersectsBox(this.min,this.max))
        {

            return true;

        }

        return false;

    }
}

import Object3D from "./lib/core/Object3D";
import Renderer from "./lib/Renderer";
import {Vector4} from "math.gl";

export default class MainLight extends Object3D{
    color =new Vector4(1,1,1,10) ;

    constructor(renderer:Renderer) {
        super(renderer,"mainLight");


    }

}

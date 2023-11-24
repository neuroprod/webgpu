import Object3D from "./lib/core/Object3D";
import Renderer from "./lib/Renderer";
import {Vector4} from "math.gl";

export default class MainLight extends Object3D{
    color =new Vector4(0.89,0.78,0.49,2) ;

    constructor(renderer:Renderer) {
        super(renderer,"mainLight");


    }

}

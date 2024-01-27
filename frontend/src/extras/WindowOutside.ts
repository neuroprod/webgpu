import Object3D from "../lib/core/Object3D";
import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import Plane from "../lib/meshes/Plane";
import LaptopTrianagleShader from "./LaptopTrianagleShader";
import Timer from "../lib/Timer";
import WindowOutsideShader from "./WindowOutsideShader";
import GameModel from "../GameModel";

export class WindowOutside extends Model{

    constructor(renderer,parent:Object3D) {
        super(renderer,"WindowOutside");
        this.mesh = new Plane(renderer);
        this.material =new Material(this.renderer,this.label,new WindowOutsideShader(this.renderer,this.label));

        this.setPosition(0.00,0,0.0)
        this.setScale(2,2,2)
        this.setEuler(0,0,0)
        parent.addChild(this)
    }
    update() {
        this.material.uniforms.setUniform("time",1-GameModel.dayNight);
        super.update();
    }
}

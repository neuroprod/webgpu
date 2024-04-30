import Object3D from "../lib/core/Object3D";
import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import Plane from "../lib/meshes/Plane";

import Timer from "../lib/Timer";

import Osc1Shader from "./Osc1Shader";

export class Osc1Screen extends Model {

    constructor(renderer, parent: Object3D) {
        super(renderer, "osc1Screen");
        this.mesh = new Plane(renderer);
        this.material = new Material(this.renderer, this.label, new Osc1Shader(this.renderer, this.label));


        this.setPosition(0.00, 0.01, 0.00)
        let scale = 0.15;
        this.setScale(scale, 1.0, scale)
        this.setEuler(0, -Math.PI / 2, 0)
        parent.addChild(this)
    }

    update() {

        this.material.uniforms.setUniform("time", Timer.time);
        super.update();
    }
}

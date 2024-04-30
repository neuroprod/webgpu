import Object3D from "../lib/core/Object3D";
import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import Plane from "../lib/meshes/Plane";

import Timer from "../lib/Timer";

import Osc2Shader from "./Osc2Shader";

export class Osc2Screen extends Model {

    constructor(renderer, parent: Object3D) {
        super(renderer, "osc2Screen");
        this.mesh = new Plane(renderer);
        this.material = new Material(this.renderer, this.label, new Osc2Shader(this.renderer, this.label));


        this.setPosition(-0.00, 0.0, -0.01)
        let scale = 0.2;
        this.setScale(scale * 1.5, 1.0, scale)
        this.setEuler(-Math.PI / 2, 0, 0)
        parent.addChild(this)
    }

    update() {

        this.material.uniforms.setUniform("time", Timer.time);
        super.update();
    }
}

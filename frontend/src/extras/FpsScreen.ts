import Object3D from "../lib/core/Object3D";
import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import Plane from "../lib/meshes/Plane";

import Timer from "../lib/Timer";
import FpsShader from "./FpsShader";
import {Vector4} from "math.gl";

export class FpsScreen extends Model {
    private didgits = new Vector4();

    constructor(renderer, parent: Object3D) {
        super(renderer, "fpsScreen");
        this.mesh = new Plane(renderer);
        this.material = new Material(this.renderer, this.label, new FpsShader(this.renderer, this.label));


        this.material.uniforms.setTexture("text", renderer.texturesByLabel["7dig.png"])
        this.setPosition(-0.00, 0.0, 0.01)
        let scale = 0.15
        this.setScale(scale * 1.5, 1.0, scale)
        this.setEuler(Math.PI / 2, 0, 0)
        parent.addChild(this)
    }

    update() {
        if (Timer.frame % 13 != 0) return;
        let fp = Timer.fps + "";
        this.didgits.set(-1, -1, -1, -1)
        let index = 4 - fp.length;
        for (let i = 0; i < fp.length; i++) {
            let n: number = Number(fp.at(i)) / 10;
            this.didgits[index] = n;
            index++;
        }
        this.material.uniforms.setUniform("value", this.didgits);
        super.update();
    }
}

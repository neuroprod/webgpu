import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import Plane from "../lib/meshes/Plane";


import FloorHitShader from "./FloorHitShader";

export class FloorHitIndicator extends Model {

    constructor(renderer) {
        super(renderer, "fpsScreen");
        this.mesh = new Plane(renderer);
        this.material = new Material(this.renderer, this.label, new FloorHitShader(this.renderer, this.label));
        this.material.depthWrite = false;
        this.material.blendModes = [{
            color: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: "add",
            },
            alpha: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: "add",
            },
        }, {
            color: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: "add",
            },
            alpha: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: "add",
            },
        }, {
            color: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: "add",
            },
            alpha: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: "add",
            },
        }];


        this.castShadow = false;


        this.setPosition(-0.00, -1.4, 0.00)
        //  let scale =0.15
        //this.setScale(scale*1.5,1.0,scale)
        //this.setEuler(Math.PI/2,0,0)
        // parent.addChild(this)
    }

}

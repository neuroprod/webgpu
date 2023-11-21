import Object3D from "../lib/core/Object3D";
import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import Plane from "../lib/meshes/Plane";
import LaptopScreenShader from "./LaptopScreenShader";
import Timer from "../lib/Timer";

export class LaptopScreen extends Model{

    constructor(renderer,parent:Object3D) {
        super(renderer,"laptopScreen");
        this.mesh = new Plane(renderer);
        this.material =new Material(this.renderer,this.label,new LaptopScreenShader(this.renderer,this.label));
        this.material.uniforms.setUniform("ratio",8/5);
        this.material.uniforms.setTexture("triangle",renderer.texturesByLabel["triangle.png"])
        this.material.uniforms.setTexture("text",renderer.texturesByLabel["text_s.png"])
        this.setPosition(0.01,0,0.05)
        this.setScale(0.8,1,0.5)
        this.setEuler(Math.PI/2,0,0)
        parent.addChild(this)
    }
    update() {
        this.material.uniforms.setUniform("time",Timer.time);
        super.update();
    }
}

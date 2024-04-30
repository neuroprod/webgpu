import Model from "../lib/model/Model";
import Renderer from "../lib/Renderer";
import GBufferShaderFish from "../shaders/GBufferShaderFish";
import Material from "../lib/core/Material";
import Timer from "../lib/Timer";
import {Vector3} from "math.gl";
import {createNoise2D, NoiseFunction2D} from "../lib/SimplexNoise";

export default class Fish {
    private fish1: Model;
    private fish2: Model;
    private center = new Vector3(-11.5, -0.2, -0.5)
    private fishTargetPrev1 = new Vector3()
    private fishTarget1 = new Vector3()
    private noise1: NoiseFunction2D;
    private angleS1 = 0;

    private fishTargetPrev2 = new Vector3()
    private fishTarget2 = new Vector3()
    private noise2: NoiseFunction2D;
    private angleS2 = 0;

    constructor(renderer: Renderer, fish1: Model, fish2: Model) {

        this.noise1 = createNoise2D();
        this.fish1 = fish1;
        this.fish1.material = new Material(renderer, "fishMat", new GBufferShaderFish(renderer, "gBufferFish"));
        this.fish1.setScale(0.8, 0.8, 0.8)

        this.noise2 = createNoise2D();
        this.fish2 = fish2;
        this.fish2.setScale(0.7, 0.7, 0.7)
        this.fish2.material = new Material(renderer, "fishMat", new GBufferShaderFish(renderer, "gBufferFish"));
        this.fish1.hitFriends.push(this.fish2);
    }


    update() {
        this.fishTarget1.from(this.center)
        let t = Timer.time * 0.05;
        this.fishTarget1.x += this.noise1(t, t * 0.3) * 1.5
        this.fishTarget1.z += this.noise1(t * 0.3, t);
        if (this.fishTarget1.z > -0.1) this.fishTarget1.z = -0.1
        this.fishTargetPrev1.subtract(this.fishTarget1)
        let angle = Math.atan2(this.fishTargetPrev1.x, this.fishTargetPrev1.z)
        this.angleS1 += (angle - this.angleS1) * 0.02;
        this.fishTargetPrev1.from(this.fishTarget1)
        //this.fishPos.y+=Math.cos(Timer.time*0.1)*0.2;
        this.fish1.setPositionV(this.fishTarget1)
        this.fish1.setEuler(0, this.angleS1 - Math.PI / 2, 0);


        this.fish1.material.uniforms.setUniform("time", Timer.time)
        this.fish2.material.uniforms.setUniform("time", Timer.time + 8.5)


        this.fishTarget2.from(this.center)
        t += 100;
        this.fishTarget2.x += this.noise2(t, t * 0.3) * 1.5
        this.fishTarget2.z += this.noise2(t * 0.3, t);
        if (this.fishTarget2.z > -0.1) this.fishTarget2.z = -0.1
        this.fishTargetPrev2.subtract(this.fishTarget2)
        angle = Math.atan2(this.fishTargetPrev2.x, this.fishTargetPrev2.z)
        this.angleS2 += (angle - this.angleS2) * 0.02;
        this.fishTargetPrev2.from(this.fishTarget2)
        //this.fishPos.y+=Math.cos(Timer.time*0.1)*0.2;
        this.fish2.setPositionV(this.fishTarget2)
        this.fish2.setEuler(0, this.angleS2 - Math.PI / 2, 0);

    }
}

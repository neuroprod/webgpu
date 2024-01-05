import Model from "../lib/model/Model";
import Renderer from "../lib/Renderer";
import GBufferShaderFish from "../shaders/GBufferShaderFish";
import Material from "../lib/core/Material";
import Timer from "../lib/Timer";
import {render} from "react-dom";
import {Vector3} from "math.gl";
import {createNoise2D, NoiseFunction2D} from "../lib/SimplexNoise";

export default class Fish{
    private fish1: Model;
    private fish2: Model;
    private center =new Vector3(-11.5,-0.2,-0.5)
    private fishTargetPrev = new Vector3()
    private fishTarget = new Vector3()
    private noise: NoiseFunction2D;
    private angleS =0;
    constructor(renderer:Renderer,fish1:Model, fish2:Model) {


        this.fish1 =fish1;
       this.noise=createNoise2D();
        this.fish1.material =new Material(renderer,"fishMat",new GBufferShaderFish(renderer,"gBufferFish"));
        this.fish1.setScale(0.8,0.8,0.8)
        this.fish2  =fish2;
        this.fish2.setScale(0.7,0.7,0.7)
        this.fish2.material =new Material(renderer,"fishMat",new GBufferShaderFish(renderer,"gBufferFish"));
    }


    update()
    {
        this.fishTarget.from(this.center)
        let t =Timer.time*0.1;
        this.fishTarget.x+=this.noise(t,t*0.3)*2.0
        this.fishTarget.z+=this.noise(t*0.3,t);
        this.fishTargetPrev.subtract(this.fishTarget)
        let angle =Math.atan2( this.fishTargetPrev.x,this.fishTargetPrev.z)
this.angleS += (angle-this.angleS)*0.05;
        this.fishTargetPrev.from(this.fishTarget)
        //this.fishPos.y+=Math.cos(Timer.time*0.1)*0.2;
        this.fish1.setPositionV(this.fishTarget)
        this.fish1.setEuler(0,this.angleS-Math.PI/2,0);
        this.fish1.material.uniforms.setUniform("time",Timer.time)
        this.fish2.material.uniforms.setUniform("time",Timer.time+8.5)

    }
}

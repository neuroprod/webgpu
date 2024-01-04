import Model from "../lib/model/Model";
import Renderer from "../lib/Renderer";
import GBufferShaderFish from "../shaders/GBufferShaderFish";
import Material from "../lib/core/Material";
import Timer from "../lib/Timer";
import {render} from "react-dom";

export default class Fish{
    private fish1: Model;
    private fish2: Model;
    constructor(renderer:Renderer,fish1:Model, fish2:Model) {
        console.log(renderer.texturesByLabel)

        this.fish1 =fish1;
        this.fish1.material =new Material(renderer,"fishMat",new GBufferShaderFish(renderer,"gBufferFish"));
        this.fish2  =fish2;

        this.fish2.material =new Material(renderer,"fishMat",new GBufferShaderFish(renderer,"gBufferFish"));
    }


    update()
    {
        this.fish1.material.uniforms.setUniform("time",Timer.time)
        this.fish2.material.uniforms.setUniform("time",Timer.time+8.5)
        
    }
}

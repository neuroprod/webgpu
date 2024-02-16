import Renderer from "../lib/Renderer";
import Model from "../lib/model/Model";
import Plane from "../lib/meshes/Plane";
import Material from "../lib/core/Material";
import FogShader from "../shaders/FogShader";
import Timer from "../lib/Timer";
import {Vector4} from "math.gl";
import Object3D from "../lib/core/Object3D";
import {BlendFactor, BlendOperation} from "../lib/WebGPUConstants";

export default class FogPlanes{
    private renderer: Renderer;
    models:Array<Model>=[]
    private numPlanes =1



    constructor(renderer:Renderer,root:Object3D) {
        this.renderer =renderer;

        let positions =[]
        positions.push(new Vector4(-24.564834625684803, -1, -0.6283240994982702,1))

        this.numPlanes=positions.length;
        let l: GPUBlendState = {

            color: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            },
            alpha: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            }
        }



        for(let i=0;i<this.numPlanes;i++){
            let fog = new Model(this.renderer,"fogPlane"+i)
            fog.mesh =new Plane(this.renderer,1,1,1,1,true)
            fog.material =new Material(this.renderer,"fogPlane"+i,new FogShader(this.renderer,"fog"))
            fog.material.depthWrite = false;
            let p = positions[i];
            fog.setPosition(p.x,p.y,p.z)
            fog.setScale(4*p.w,1*p.w,1*p.w)
            fog.setEuler(Math.PI/2,0,0)
            fog.material.blendModes = [l];
            this.models.push(fog)
        }


    }

    update() {
        for(let i=0;i<this.numPlanes;i++){
            let fp =this.models[i]
            fp.material.uniforms.setUniform("time",Timer.time*0.04+i*0.5)

        }
    }
}

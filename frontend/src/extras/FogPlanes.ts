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
    private numPlanes =5



    constructor(renderer:Renderer,root:Object3D) {
        this.renderer =renderer;

        let positions =[]
       /* positions.push(new Vector4(-24.564834625684803, -1, -0.6283240994982702,1))
        positions.push(new Vector4(-26.08862660266798, -1, -3.139499238590094,1))
        positions.push(new Vector4(-23.549826210427504, -1, -4.76017240089908,2))
        positions.push(new Vector4(-20.34237531162366, -1, -1.767403203532579,1))
        positions.push(new Vector4(-17.948456879830314, -1, -6.5704813639812905,2))
        positions.push(new Vector4(-24.07223937301294, -1, -0.2,2))
        positions.push(new Vector4(-17.07223937301294, -1, 0.01,1))
        positions.push(new Vector4(-20.07223937301294, -1, -0.2,1.5))*/
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

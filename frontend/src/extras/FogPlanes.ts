import Renderer from "../lib/Renderer";
import Model from "../lib/model/Model";
import Plane from "../lib/meshes/Plane";
import Material from "../lib/core/Material";
import FogShader from "../shaders/FogShader";
import Timer from "../lib/Timer";
import {Vector4} from "math.gl";
import Object3D from "../lib/core/Object3D";
import {BlendFactor, BlendOperation} from "../lib/WebGPUConstants";
import GameModel from "../../public/GameModel";

export default class FogPlanes {
    private renderer: Renderer;
    models: Array<Model> = []
    private numPlanes = 1


    constructor(renderer: Renderer, root: Object3D) {
        this.renderer = renderer;

        let positions = []
        //positions.push(new Vector4(-22, -1, 2,2))
        //positions.push(new Vector4(-22, -1, 1,2))
        positions.push(new Vector4(-24, -1, -5, 2))
        positions.push(new Vector4(-24, -1, -2.5, 2))
        positions.push(new Vector4(-24, -1, 0, 2))
        this.numPlanes = positions.length;
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


        for (let i = 0; i < this.numPlanes; i++) {
            let fog = new Model(this.renderer, "fogPlane" + i)
            fog.mesh = new Plane(this.renderer, 1, 1, 10, 1, true)
            fog.material = new Material(this.renderer, "fogPlane" + i, new FogShader(this.renderer, "fog"))
            fog.material.depthWrite = false;
            fog.material.blendModes = [l];
            let p = positions[i];
            fog.setPosition(p.x, p.y, p.z)
            fog.setScale(6 * p.w, 1 * p.w, 1 * p.w)
            fog.setEuler(Math.PI / 2, 0, 0)
            //fog.material.blendModes = [l];
            this.models.push(fog)
        }


    }

    update() {

        for (let i = 0; i < this.numPlanes; i++) {
            let fp = this.models[i]

            if (GameModel.dayNight == 0) {
                fp.visible = false;
            } else {
                fp.visible = true;
                fp.material.uniforms.setUniform("time", Timer.time * 0.04 + i * 123.5)

                fp.material.uniforms.setTexture("shadowCubeDebug", this.renderer.texturesByLabel["ShadowCubeColor1"]);
                fp.material.uniforms.setUniform("pointlightColor", GameModel.lightOutsidePass.lightColor)
                fp.material.uniforms.setUniform("pointlightPos", new Vector4(GameModel.lightOutsidePass.lightPos.x, GameModel.lightOutsidePass.lightPos.y, GameModel.lightOutsidePass.lightPos.z, 1));


            }


        }
    }
}

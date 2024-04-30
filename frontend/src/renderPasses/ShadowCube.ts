import Renderer from "../lib/Renderer";
import ShadowCubePass from "./ShadowCubePass";
import RenderTexture from "../lib/textures/RenderTexture";
import {TextureFormat} from "../lib/WebGPUConstants";
import Camera from "../lib/Camera";
import {Vector3} from "math.gl";

import Model from "../lib/model/Model";
import GameModel from "../../public/GameModel";


export default class ShadowCube {
    public depthTarget: RenderTexture;
    private passes: Array<ShadowCubePass> = []
    private cameras: Array<Camera> = [];

    private colorTarget: RenderTexture;
    private offsets = [new Vector3(-1, 0, 0), new Vector3(1, 0, 0), new Vector3(0, -1, 0), new Vector3(0, 1, 0), new Vector3(0, 0, -1), new Vector3(0, 0, 1)]
    private drawAll: boolean = true;
    public frame = 0;

    constructor(renderer: Renderer, depthTarget: RenderTexture, name: string) {

        let tSize = 512;
        this.depthTarget = new RenderTexture(renderer, "ShadowCubeDepth" + name, {
            format: TextureFormat.Depth16Unorm,
            sampleCount: 1,
            scaleToCanvas: false,
            width: tSize,
            height: tSize,
            depthOrArrayLayers: 6,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthTarget.make()


        this.colorTarget = new RenderTexture(renderer, "ShadowCubeColor" + name, {
            format: TextureFormat.R16Float,
            sampleCount: 1,
            scaleToCanvas: false,
            width: tSize,
            height: tSize,
            depthOrArrayLayers: 6,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorTarget.make()


        // let wp = this.light.getWorldPos();


        const ups = [new Vector3(0, -1, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1), new Vector3(0, -1, 0), new Vector3(0, -1, 0)]

        for (let i = 0; i < 6; i++) {
            let camera = new Camera(renderer, "cubeCamera")

            camera.fovy = Math.PI / 2
            camera.near = 0.01;
            camera.far = 10;

            // camera.cameraWorld =wp;
            // camera.cameraLookAt =wp.clone().add(this.offsets[i]);
            camera.cameraUp = ups[i];


            this.cameras.push(camera);

            let pass = new ShadowCubePass(renderer, this.depthTarget, i, camera, this.colorTarget);
            this.passes.push(pass);
        }


    }

    setModels(models: Array<Model>) {
        this.frame = 0;
        for (let i = 0; i < 6; i++) {
            this.passes[i].models = models;
        }
        this.drawAll = true;
    }

    public add() {

        if (this.frame < 3) {

            for (let p of this.passes) {

                p.add();
            }
        } else {
            let count = this.frame;
            for (let p of this.passes) {
                if (p.camera.modelInFrustum(GameModel.characterHandler.body)) p.add()
                else if (count % 6 == 0) {
                    p.add();

                }
            }
        }
        this.frame++;
    }


    setLightPos(lightPos: Vector3) {

        let count = 0;
        for (let camera of this.cameras) {

            camera.cameraWorld.from(lightPos);
            camera.cameraLookAt.from(lightPos);
            camera.cameraLookAt.add(this.offsets[count]);

            count++;
        }
    }

    setDirty() {
        for (let i = 0; i < 6; i++) {
            this.passes[i].setDirty();
        }
    }
}

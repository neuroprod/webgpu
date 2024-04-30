import Renderer from "../Renderer";
import TextureLoader from "../textures/TextureLoader";
import PreLoader from "../PreLoader";
import Material from "../core/Material";

import {BlendFactor, BlendOperation} from "../WebGPUConstants";
import BitmapShader from "../../shaders/BitmapShader";
import Plane from "../meshes/Plane";
import UIModel from "./UIModel";


export default class UIBitmapModel extends UIModel {
    private textureLoader: TextureLoader;
    public textureHeight: number = 0;
    public textureWidth: number = 0;

    constructor(renderer: Renderer, preLoader: PreLoader, label: string, url: string) {
        super(renderer, label, true);
        this.mouseEnabled = true;
        let t = this.renderer.texturesByLabel[url];
        this.material = new Material(this.renderer, "bitmapMaterial", new BitmapShader(this.renderer, "bitmapShader"))
        this.material.depthWrite = false;
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

        this.material.blendModes = [l];

        if (!t) {
            this.textureLoader = new TextureLoader(renderer, preLoader, url, {});

        } else {
            this.textureLoader = t as TextureLoader;

        }


    }

    public update() {
        if (!this.visible) return;
        if (!this.mesh && this.textureLoader.loaded) {
            this.makeMesh()
        }
        super.update()

    }

    private makeMesh() {
        this.textureWidth = this.textureLoader.options.width;
        this.textureHeight = this.textureLoader.options.height;


        this.material.uniforms.setTexture("colorTexture", this.textureLoader)
        this.mesh = new Plane(this.renderer, this.textureWidth, this.textureHeight, 1, 1, false)
        this.mesh.min.set(-this.textureWidth / 2, -this.textureHeight / 2, 0)
        this.mesh.max.set(this.textureWidth / 2, this.textureHeight / 2, 0)
    }
}

import Model from "./Model";
import Renderer from "../Renderer";
import TextureLoader from "../textures/TextureLoader";
import PreLoader from "../PreLoader";
import Quad from "../meshes/Quad";
import Material from "../core/Material";

import {BlendFactor, BlendOperation} from "../WebGPUConstants";
import BitmapShader from "../../shaders/BitmapShader";
import Plane from "../meshes/Plane";
import UIModel from "./UIModel";



export default class UIBitmapModel extends UIModel {
    private textureLoader: TextureLoader;

    constructor(renderer: Renderer,preLoader:PreLoader,label:string, url: string) {
        super(renderer, label,true);
        this.mouseEnabled =true;
        this.textureLoader = new TextureLoader(renderer,preLoader,url,{});
        this.textureLoader.onComplete =()=>{
            this.makeMesh()
        }
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
    }
    public update() {
        if(!this.visible)return;

        super.update()

    }

    private makeMesh() {
        let w =this.textureLoader.options.width;
        let h =this.textureLoader.options.height;




        this.material.uniforms.setTexture("colorTexture",this.textureLoader)
        this.mesh =new Plane(this.renderer,w,h,1,1,false)
        this.mesh.min.set(-w/2,-h/2,0)
        this.mesh.max.set(w/2,h/2,0)
    }
}

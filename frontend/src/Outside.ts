import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";

import GLFTLoader from "./GLFTLoader";
import ModelRenderer from "./lib/model/ModelRenderer";
import Object3D from "./lib/core/Object3D";
import GameModel from "./GameModel";
import mapRange = gsap.utils.mapRange;
import {clamp} from "math.gl";



export default class Outside {
    modelRenderer: ModelRenderer;
    modelRendererTrans: ModelRenderer;
    root: Object3D
    private renderer: Renderer;
    private glFTLoader: GLFTLoader;
   public lightGrave: Object3D;

    constructor(renderer: Renderer, preloader: PreLoader) {

        this.renderer = renderer;
        this.glFTLoader = new GLFTLoader(this.renderer, "outside", preloader);

    }

    init() {
        this.modelRenderer = new ModelRenderer(this.renderer, "outside");
        this.modelRendererTrans = new ModelRenderer(this.renderer, "outsideTrans");

        this.root = this.glFTLoader.root

        this.lightGrave = this.glFTLoader.objectsByName["lightGrave"];
        for (let m of this.glFTLoader.models) {
            this.modelRenderer.addModel(m)

        }
    }

    public update() {

        let pos =-GameModel.characterPos.x;


        GameModel.dayNight =clamp((pos-13)/7,0,1);
        //GameModel.dayNight
        // UI.LFloat('offset',0)
        //  this.glFTLoader.root.setPosition(this.renderer.ratio * 4 / 2 +UI.LFloat('offset',0), -1.5, 0)
    }

    makeTransParent() {
        for (let m of this.glFTLoader.modelsGlass) {

            m.material.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
            m.material.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["LightPass"])
            this.modelRendererTrans.addModel(m)

        }
    }


}

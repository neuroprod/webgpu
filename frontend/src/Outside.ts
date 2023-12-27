import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";

import GLFTLoader from "./GLFTLoader";
import ModelRenderer from "./lib/model/ModelRenderer";
import Object3D from "./lib/core/Object3D";
import GameModel from "./GameModel";

import Scene from "./Scene";
import {clamp} from "math.gl";
import Timer from "./lib/Timer";



export default class Outside extends Scene{
    modelRenderer: ModelRenderer;
    modelRendererTrans: ModelRenderer;
    root: Object3D


   public lightGrave: Object3D;


    constructor(renderer: Renderer, preloader: PreLoader) {

        super(renderer,preloader,"outside")


    }

    init() {
        this.modelRenderer = new ModelRenderer(this.renderer, "outside");
        this.modelRendererTrans = new ModelRenderer(this.renderer, "outsideTrans");

        this.root = this.glFTLoader.root
        this.root.setPosition(0,-1.5,0)
        this.lightGrave = this.glFTLoader.objectsByName["lightGrave"];
        for (let m of this.glFTLoader.models) {
            this.modelRenderer.addModel(m)

        }
    }

    public update() {

        let pos =-GameModel.characterPos.x;


        GameModel.dayNight =clamp((pos-13)/7,0,1);


        for (let m of this.glFTLoader.models) {
            if(m.needsWind){
                m.material.uniforms.setUniform("time",Timer.time)
            }
        }
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


    onUI() {
        this.glFTLoader.root.onUI();
    }
}

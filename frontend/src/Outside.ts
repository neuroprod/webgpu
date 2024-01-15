import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";

import GLFTLoader from "./GLFTLoader";
import ModelRenderer from "./lib/model/ModelRenderer";
import Object3D from "./lib/core/Object3D";
import GameModel from "./GameModel";

import Scene from "./Scene";
import {clamp} from "math.gl";
import Timer from "./lib/Timer";
import MailBox from "./extras/MailBox";
import Material from "./lib/core/Material";
import WaterTopShader from "./shaders/WaterTopShader";
import Model from "./lib/model/Model";
import WaterFrontShader from "./shaders/WaterFrontShader";
import Fish from "./extras/Fish";
import FogPlanes from "./extras/FogPlanes";



export default class Outside extends Scene{
    modelRenderer: ModelRenderer;
    modelRendererTrans: ModelRenderer;
    root: Object3D


   public lightGrave: Object3D;
    public mailBox:MailBox;
    private waterTop: Model;
    private waterFront: Model;
    private fish: Fish;
    private fogPlanes: FogPlanes;

    constructor(renderer: Renderer, preloader: PreLoader) {

        super(renderer,preloader,"outside")


    }

    init() {
        this.modelRenderer = new ModelRenderer(this.renderer, "outside");
        this.modelRendererTrans = new ModelRenderer(this.renderer, "outsideTrans");

        this.root = this.glFTLoader.root
        this.root.setPosition(0,-1.5,0)
        this.lightGrave = this.glFTLoader.objectsByName["lightGrave"];

         this.fish =new Fish(this.renderer,this.glFTLoader.modelsByName["fish1"],     this.glFTLoader.modelsByName["fish2"]);

        for (let m of this.glFTLoader.models) {
            this.modelRenderer.addModel(m)

        }

        this.mailBox =new MailBox(this.glFTLoader);
    }

    public update() {

this.fogPlanes.update()
        this.fish.update();
        //GameModel.dayNight
        this.waterTop.material.uniforms.setUniform("time",Timer.time*0.05)


        //GameModel.dayNight
        // UI.LFloat('offset',0)
        //  this.glFTLoader.root.setPosition(this.renderer.ratio * 4 / 2 +UI.LFloat('offset',0), -1.5, 0)
    }

    makeTransParent() {

        this.fogPlanes =new FogPlanes(this.renderer,this.glFTLoader.root)
        for (let m of this.fogPlanes.models) {
            this.modelRendererTrans.addModel(m)

        }

        for (let m of this.glFTLoader.modelsGlass) {
            if(m.label =="waterTop_G"){
                m.material  = new Material(this.renderer,m.label, new WaterTopShader(this.renderer,"waterTop"));
                m.material.depthWrite = false;
                this.waterTop =m;
            }
            if(m.label =="waterFront_G"){
                m.material  = new Material(this.renderer,m.label, new WaterFrontShader(this.renderer,"waterFront"));
                m.material.depthWrite = false;
                this.waterFront =m;
            }
            m.material.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
            m.material.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["BlurLightPass"])
            this.modelRendererTrans.addModel(m)

        }
    }

    onUIGame(){
    this.mailBox.onUI()
    }

}

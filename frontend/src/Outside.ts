import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import ModelRenderer from "./lib/model/ModelRenderer";
import Object3D from "./lib/core/Object3D";

import Scene from "./Scene";
import Timer from "./lib/Timer";
import MailBox from "./extras/MailBox";
import Material from "./lib/core/Material";
import WaterTopShader from "./shaders/WaterTopShader";
import Model from "./lib/model/Model";
import WaterFrontShader from "./shaders/WaterFrontShader";
import Fish from "./extras/Fish";
import FogPlanes from "./extras/FogPlanes";
import Leaves from "./extras/Leaves";
import TextureLoader from "./lib/textures/TextureLoader";
import GameModel from "./GameModel";
import {Vector3} from "math.gl";
import FogShader from "./shaders/FogShader";
import GlassGlowShader from "./shaders/GlassGlowShader";


export default class Outside extends Scene {
    modelRenderer: ModelRenderer;
    modelRendererTrans: ModelRenderer;
    root: Object3D


    public lightGrave: Object3D;
    public mailBox: MailBox;
    private waterTop: Model;
    private waterFront: Model;
    private fish: Fish;
    private fogPlanes: FogPlanes;
    private leaves: Leaves;
    private lightGraveHolder: Object3D;
    private lightGraveHolderPos: Vector3;

    private glassGrave: Model;
    private materialGlass: Material;
    private materialGlow: Material;
    constructor(renderer: Renderer, preloader: PreLoader) {

        super(renderer, preloader, "outside")
        new TextureLoader(this.renderer, preloader, "leaveAlpha.png", {});
        new TextureLoader(this.renderer, preloader, "leaveColor.png", {});
        new TextureLoader(this.renderer, preloader, "fog.png", {});
    }

    init() {
        this.modelRenderer = new ModelRenderer(this.renderer, "outside");
        this.modelRendererTrans = new ModelRenderer(this.renderer, "outsideTrans");

        this.root = this.glFTLoader.root
        this.root.setPosition(0, -1.5, 0)
        this.lightGraveHolder  = this.glFTLoader.objectsByName["lightGrave"];
        this.lightGraveHolderPos =this.lightGraveHolder.getPosition().clone();
        this.lightGrave = new Object3D(this.renderer)
        this.lightGrave.setPosition(0,-0.2,0.0)
        this.lightGraveHolder.addChild(this.lightGrave)
        this.glFTLoader.modelsByName["sky"].material.depthWrite =false;
        this.fish = new Fish(this.renderer, this.glFTLoader.modelsByName["fish1"], this.glFTLoader.modelsByName["fish2"]);
        this.glassGrave = this.glFTLoader.modelsByName["lightGrave_G"]

        this.glassGrave.material.uniforms.setTexture("normalTexture",this.renderer.texturesByLabel["WaterNormal.jpg"]);
        this.materialGlass = this.glassGrave.material;
        this.materialGlow = new Material(this.renderer,"glassGlow",new GlassGlowShader(this.renderer,'glassGlow'));
        this.materialGlow.depthWrite = false;
        for (let m of this.glFTLoader.models) {
            this.modelRenderer.addModel(m)

        }
        this.leaves =new Leaves(this.renderer)
        this.modelRenderer.addModel(this.leaves.model)
        this.mailBox = new MailBox(this.glFTLoader);
    }

    public update() {

        this.fogPlanes.update()
        this.fish.update();
        this.leaves.update()
        //GameModel.dayNight
        this.waterTop.material.uniforms.setUniform("time", Timer.time * 0.05)

        this.waterFront.material.uniforms.setUniform("dayNight", GameModel.dayNight)
        this.waterTop.material.uniforms.setUniform("dayNight", GameModel.dayNight)


        if(GameModel.dayNight==0)
        {
            this.glassGrave.material = this.materialGlass

        }else{
            this.glassGrave.material = this.materialGlow
        }


        for (let m of this.glFTLoader.models) {
            if (m.needsWind) {
                m.material.uniforms.setUniform("time", Timer.time)
                if (m.castShadow) {
                    if (m.shadowMaterial.uniforms)
                    m.shadowMaterial.uniforms.setUniform("time", Timer.time)
                }
            }
        }
    // this.lightGraveHolderPosMove.from(this.lightGraveHolderPos)
      // this.lightGraveHolderPosMove.y +=Math.sin(Timer.time*2)

        //this.lightGraveHolder.setPositionV( this.lightGraveHolderPosMove);
        //GameModel.dayNight
        // UI.LFloat('offset',0)
        //  this.glFTLoader.root.setPosition(this.renderer.ratio * 4 / 2 +UI.LFloat('offset',0), -1.5, 0)
    }

    makeTransParent() {

        this.fogPlanes = new FogPlanes(this.renderer, this.glFTLoader.root)
        for (let m of this.fogPlanes.models) {
            this.modelRendererTrans.addModel(m)

        }

        for (let m of this.glFTLoader.modelsGlass) {
            if (m.label == "waterTop_G") {
                m.material = new Material(this.renderer, m.label, new WaterTopShader(this.renderer, "waterTop"));
                m.material.depthWrite = false;
                this.waterTop = m;
            }
            if (m.label == "waterFront_G") {
                m.material = new Material(this.renderer, m.label, new WaterFrontShader(this.renderer, "waterFront"));
                m.material.depthWrite = false;
                this.waterFront = m;
            }
            m.material.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
            m.material.uniforms.setTexture("reflectTexture", this.renderer.texturesByLabel["BlurLightPass"])
            this.modelRendererTrans.addModel(m)

        }
    }

    onUIGame() {
        this.mailBox.onUI()
    }

}

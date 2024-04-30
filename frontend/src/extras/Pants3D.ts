import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GLFTLoader from "../GLFTLoader";
import Model from "../lib/model/Model";
import Pants3DShader from "./Pants3DShader";
import Material from "../lib/core/Material";
import ModelRenderer from "../lib/model/ModelRenderer";
import PantsRenderPass from "../renderPasses/PantsRenderPass";
import UI from "../lib/UI/UI";
import Timer from "../lib/Timer";
import gsap from "gsap";
import {NumericArray, Quaternion} from "math.gl";
import GameModel from "../../public/GameModel";
import Pants3DEndShader from "./Pants3DEndShader";

export enum PantsState {
    StartPants,
    AddTriangles,
    MakeShape,
    finishTriangle,
    StartPantsEnd,
    EndPants,
    Textures,
    Shading,
    Post,
}

export default class Pants3D {
    private renderer: Renderer;
    private glFTLoader: GLFTLoader;
    private pants: Model;
    modelRendererTrans: ModelRenderer;
    pantsRenderPass: PantsRenderPass;
    private visible: boolean = true;

    private inScale: number = 2.49;
    private outScale: number = 0.1;
    private baseTriangle: number = 1;
    private lineThickness: number = 2;
    private rotation: Quaternion;
    private target: Quaternion;
    currentState: PantsState = PantsState.StartPants
    private time: number = 0;
    private pantsScale = 3;
    private triangleMaterial: Material;
    private pantsMaterial: Material;
    private shading: number = 0;
    private textures = 0;
    private distortValue: number = 0;

    constructor(renderer: Renderer, preloader: PreLoader) {

        this.renderer = renderer

        this.glFTLoader = new GLFTLoader(this.renderer, "pants", preloader);
        this.glFTLoader.barycentric = true;


        this.modelRendererTrans = new ModelRenderer(renderer)
        this.rotation = new Quaternion();
        this.target = new Quaternion();
    }

    init() {
        this.pantsRenderPass = new PantsRenderPass(this.renderer)
        this.pants = this.glFTLoader.modelsByName["pants3D"];
        this.pants.castShadow = false;
        this.triangleMaterial = new Material(this.renderer, "pants3D", new Pants3DShader(this.renderer, "pants3DShader"));
        this.pantsMaterial = new Material(this.renderer, "pants3Dend", new Pants3DEndShader(this.renderer, "pants3DEndShader"));
        this.pants.material = this.triangleMaterial;
        this.pants.material.depthWrite = true
        this.pants.needCulling = false;
        this.pants.setScale(3, 3, 3)
        this.pantsRenderPass.modelRenderer.addModel(this.pants)

    }

    onUI() {
        this.visible = true;
        UI.pushWindow("WorkVisuals");
        GameModel.compVisible = UI.LBool("show", false);
        if (UI.LButton("S0")) {
            this.setState(PantsState.StartPants)
        }
        if (UI.LButton("S1")) {
            this.setState(PantsState.AddTriangles)
        }
        if (UI.LButton("S2")) {
            this.setState(PantsState.MakeShape)
        }
        if (UI.LButton("S3")) {
            this.setState(PantsState.finishTriangle)
        }
        if (UI.LButton("SE1")) {
            this.setState(PantsState.StartPantsEnd)
        }
        /*this.baseTriangle = UI.LFloatSlider("baseTriangle",this.baseTriangle);
        this.explode = UI.LFloatSlider("explode",this.explode);
        this.inScale = UI.LFloatSlider("inScale",this.inScale);
        this.outScale = UI.LFloatSlider("outScale",this.outScale);*/
        UI.popWindow()
    }

    setState(state: PantsState) {

        this.currentState = state
        if (state == PantsState.StartPants) {
            GameModel.compVisible = true
            this.pants.material = this.triangleMaterial;
            this.time = 0;
            this.baseTriangle = 1;
            this.outScale = 5;
            this.lineThickness = 5;
            this.pantsScale = 0;
            this.textures = 0
            this.shading = 0;
            gsap.to(this, {pantsScale: 3})
        }
        if (state == PantsState.AddTriangles) {
            this.pants.material = this.triangleMaterial;
            gsap.to(this, {baseTriangle: 0, duration: 2, ease: "power3.out"})
            gsap.to(this, {outScale: 0.15, duration: 2, ease: "power3.out"})
            gsap.to(this, {lineThickness: 1, duration: 2, ease: "power3.out"})
        }
        if (state == PantsState.MakeShape) {
            this.pants.material = this.triangleMaterial;
            gsap.to(this, {baseTriangle: 0})
            gsap.to(this, {outScale: 0.0, duration: 1.5, ease: "power3.out"})
            gsap.to(this, {lineThickness: 1, duration: 1.5, ease: "power3.out"})
        }
        if (state == PantsState.finishTriangle) {
            this.pants.material = this.triangleMaterial;
            gsap.to(this, {pantsScale: 0})
            gsap.delayedCall(1.5, () => {
                GameModel.compVisible = false
            })
        }
        if (state == PantsState.Textures) {
            console.log("texture")
            GameModel.compVisible = true
            this.lineThickness = 1;
            this.shading = 0;
            this.pants.material = this.pantsMaterial;
            gsap.to(this, {textures: 3.0, delay: 1})
            gsap.to(this, {lineThickness: 0, duration: 1.0, delay: 0.5, ease: "power3.out"})
            gsap.to(this, {pantsScale: 3.0})

        }
        if (state == PantsState.Shading) {

            GameModel.compVisible = true
            this.lineThickness = 0;
            this.pants.material = this.pantsMaterial;
            gsap.to(this, {shading: 1, duration: 1.0, ease: "power3.out"})
            gsap.to(this, {pantsScale: 3.0})

        }
        if (state == PantsState.Post) {
            gsap.to(this, {distortValue: 2, ease: "back.out"})
            gsap.to(this, {pantsScale: 3.4, ease: "back.out"})

        }

        if (state == PantsState.EndPants) {
            gsap.to(this, {distortValue: -2, delay: 2.5, duration: 0.5})
            this.pants.material = this.pantsMaterial;
            gsap.to(this, {pantsScale: 0, delay: 0.4, ease: "back.in"})
            gsap.delayedCall(2.5, () => {
                GameModel.compVisible = false
            })

        }

    }

    update() {
        if (GameModel.compVisible) {
            this.time += Timer.delta;
            this.glFTLoader.root.setPosition(1.7, 0, 0)

            if (this.currentState == PantsState.StartPants) {
                this.target.setAxisAngle([0, 0, 1], this.time * 0.4)
            } else {
                this.target.setAxisAngle([0, 1, 0], this.time)
            }
            this.rotation.slerp(this.target as NumericArray, 0.03)

            this.pantsMaterial.uniforms.setUniform("lineThickness", this.lineThickness)
            this.pantsMaterial.uniforms.setUniform("shading", this.shading)
            this.pantsMaterial.uniforms.setUniform("text", Math.floor(Timer.time * 3) % 3)
            this.triangleMaterial.uniforms.setUniform("baseTriangle", this.baseTriangle)
            this.triangleMaterial.uniforms.setUniform("lineThickness", this.lineThickness)
            this.triangleMaterial.uniforms.setUniform("time", Timer.time * 0.3)
            this.triangleMaterial.uniforms.setUniform("inScale", this.inScale)
            this.triangleMaterial.uniforms.setUniform("outScale", this.outScale)
            this.pants.setRotationQ(this.rotation)
            this.pants.setScale(this.pantsScale, this.pantsScale, this.pantsScale)


            GameModel.main.combinePass.blitMaterial.uniforms.setUniform("pantsOffset", Math.round(this.distortValue))
        }

    }
}

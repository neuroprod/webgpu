import PreLoader from "./lib/PreLoader";

import Renderer from "./lib/Renderer";
import JSONLoader from "./JSONLoader";

import Model from "./lib/model/Model";
import Font, {TEXT_ALIGN} from "./lib/text/Font";
import FontMeshRenderer from "./lib/text/FontMeshRenderer";
import GameModel from "./GameModel";
import Material from "./lib/core/Material";
import FontShader from "./lib/text/FontShader";
import {BlendFactor, BlendOperation} from "./lib/WebGPUConstants";
import {isArray, Vector3, Vector4} from "math.gl";
import gsap from "gsap";
import UI from "./lib/UI/UI";

export default class TextHandler {


    public hitTriggers: any;
    public hitTriggerByLabel: { [name: string]: any } = {};
    font: Font;
    fontMeshRenderer: FontMeshRenderer;
    //
    private renderer: Renderer;
    private jsonLoader: JSONLoader;
    private currentHitText: Model;
    private hitTextTarget: Vector3;
    private hitTextAlpha: number;
    private objectLabel: string;
    private fontEdge =new Vector4(0.25,0.30,0.45,0.50);

    constructor(renderer: Renderer, preLoader: PreLoader) {
        this.jsonLoader = new JSONLoader("copy", preLoader)
        this.renderer = renderer;
    }

    public init() {
        let data = this.jsonLoader.data;

        this.hitTriggers = data.hitTriggers;
        for (let d of this.hitTriggers) {
            this.hitTriggerByLabel[d.object] = d;
            d.count =0;
            d.readAll =false;
        }

        for (let d of data.text) {
            this.hitTriggerByLabel[d.object] = d;
            d.count =0;
            d.readAll =false;
        }
    }
onUI(){
        UI.LVector("fontedge",this.fontEdge);

}
    public update() {
        if (this.currentHitText) {
            this.currentHitText.setPositionV(this.hitTextTarget)
            this.currentHitText.material.uniforms.setUniform("alpha", this.hitTextAlpha)
            this.currentHitText.material.uniforms.setUniform("fontEdge", this.fontEdge)
            this.currentHitText.update()
        }
    }

    showHitTrigger(objectLabel: string) {

        this.objectLabel =objectLabel;
        this.hideHitTrigger()
        let ht = this.hitTriggerByLabel[objectLabel];
        let copy ="";
        if(isArray(ht.copy)){
            copy = ht.copy[ht.count]
            ht.count++;

            if(ht.count>=ht.copy.length){
                ht.count=0;
                ht.readAll=true;
            }

        }else{
            copy = ht.copy;
        }
        this.currentHitText = new Model(this.renderer,"text_"+ objectLabel,false);
        this.currentHitText.material = new Material(this.renderer, "fontmaterial", new FontShader(this.renderer, "fontShader"))
        this.currentHitText.material.depthWrite = false;
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

        this.currentHitText.material.blendModes = [l];


        gsap.killTweensOf(this.hitTextTarget)
        gsap.killTweensOf(this)
        this.hitTextTarget = GameModel.characterPos.clone()
        let p =GameModel.gameCamera.getScreenPos( this.hitTextTarget.clone())
        let p2 =GameModel.gameCamera.getScreenPos( this.hitTextTarget.clone().add([1,0,0]))
       let d =0.35/(p.distance(p2)) ;

        let align = TEXT_ALIGN.LEFT;
        let offset =0.25;
        if(p.x>0){
            align = TEXT_ALIGN.RIGHT;
            offset =-0.25;
        }

        this.hitTextTarget.y = -1.5 + 2.0;
        this.hitTextTarget.x += offset;

        this.hitTextAlpha = 0;
        this.update();

        gsap.to(this.hitTextTarget, {x: this.hitTextTarget.x +  offset, ease: "expo.out", duration: 0.5})
        gsap.to(this, {hitTextAlpha: 1, duration: 0.5})
        this.currentHitText.mesh = this.font.getMesh(copy, align,0.5);


        this.currentHitText.setScale(d, d, d);
        this.fontMeshRenderer.addText(this.currentHitText);
    }

    hideHitTrigger(objectLabel: string = "") {

        gsap.killTweensOf(this.hitTextTarget)
        gsap.killTweensOf(this)
        if (this.currentHitText) {

            if (objectLabel) {


                gsap.to(this, {
                    hitTextAlpha: 0, duration: 0.5, onComplete: () => {
                        this.fontMeshRenderer.removeText(this.currentHitText);
                        this.currentHitText.destroy()

                        this.currentHitText = null;

                    }
                })
            } else {
                this.fontMeshRenderer.removeText(this.currentHitText);
                this.currentHitText.destroy();
                this.currentHitText = null;
            }


        }
    }

    readNext() {

        let ht = this.hitTriggerByLabel[this.objectLabel];

        if(isArray(ht.copy)){

           if(ht.count==0 ){
               this.hideHitTrigger();
               return true;
           }

        }else{
            this.hideHitTrigger();
           return true
        }

        this.showHitTrigger(this.objectLabel)

        return false;
    }
}

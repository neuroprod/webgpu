import PreLoader from "./lib/PreLoader";

import Renderer from "./lib/Renderer";
import JSONLoader from "./JSONLoader";

import Model from "./lib/model/Model";
import Font, {TEXT_ALIGN} from "./lib/text/Font";
import FontMeshRenderer from "./lib/text/FontMeshRenderer";
import GameModel from "../public/GameModel";
import Material from "./lib/core/Material";
import FontShader from "./lib/text/FontShader";
import {BlendFactor, BlendOperation} from "./lib/WebGPUConstants";
import {isArray, NumericArray, Vector3, Vector4} from "math.gl";
import gsap from "gsap";
import UI from "./lib/UI/UI";
import Timer from "./lib/Timer";

export default class TextHandler {


    public hitTriggers: any;
    public hitTriggerByLabel: { [name: string]: any } = {};
    font: Font;
    fontMeshRenderer: FontMeshRenderer;
    public words = 0;
    //
    private renderer: Renderer;
    private jsonLoader: JSONLoader;
    private currentHitText: Model;
    private hitTextTarget: Vector3 = new Vector3();
    private hitTextAlpha: number;
    private objectLabel: string;
    private fontEdge = new Vector4(0.25, 0.30, 0.45, 0.53);
    private numChars: number;
    private showChars = 10;
    private keepRight: boolean = false;
    private adj: number = 0;

    constructor(renderer: Renderer, preLoader: PreLoader) {
        this.jsonLoader = new JSONLoader("copy", preLoader)
        this.renderer = renderer;
        if (this.renderer.pixelRatio == 1) this.fontEdge.z = 0.33;
    }

    public init() {
        let data = this.jsonLoader.data;

        this.hitTriggers = data.hitTriggers;
        for (let d of this.hitTriggers) {
            this.hitTriggerByLabel[d.object] = d;
            d.count = 0;

            for (let s of d.copy) {
                this.wordCount(s)
            }

            d.readAll = false;
        }

        for (let d of data.text) {
            this.hitTriggerByLabel[d.object] = d;
            d.count = 0;

            for (let s of d.copy) {
                this.wordCount(s)
            }
            d.readAll = false;
        }
        //  console.log("num words" ,this.words);
    }

    public wordCount(s: string) {
        s = s.replace("\n", " ")
        let a = s.split(" ")

        this.words += a.length
    }

    onUI() {
        UI.LVector("fontedge", this.fontEdge);

    }

    public update() {
        if (this.currentHitText) {
            this.currentHitText.material.uniforms.setUniform("time", Timer.time)
            this.currentHitText.setPositionV(this.hitTextTarget)
            this.currentHitText.material.uniforms.setUniform("alpha", this.hitTextAlpha)
            this.currentHitText.material.uniforms.setUniform("fontEdge", this.fontEdge)
            this.currentHitText.update()
            if (this.currentHitText.mesh) {

                this.currentHitText.mesh.numDrawIndices = Math.ceil(this.showChars) * 6;
            }

        }
    }

    showHitTrigger(objectLabel: string, keepRight: boolean = false, adjY = 0) {
        this.keepRight = keepRight;
        this.adj = adjY;
        if (GameModel.characterHandler.isWalking) {
            GameModel.characterHandler.setIdleAndTurn()
        }
        //GameModel.sound.playClick(0.2)
        this.objectLabel = objectLabel;
        this.hideHitTrigger()
        let ht = this.hitTriggerByLabel[objectLabel];
        let multiline = false;
        let copy = "";
        if (ht) {
            if (isArray(ht.copy)) {

                if (ht.random) {


                    copy = ht.copy[ht.count]
                    ht.count++;
                    if (ht.count >= ht.copy.length) {
                        ht.count = 0;
                    }
                    ht.readAll = true;
                } else {


                    copy = ht.copy[ht.count]
                    ht.count++;
                    multiline = true
                    if (ht.count >= ht.copy.length) {
                        ht.count = 0;
                        ht.readAll = true;
                        multiline = false
                    }
                }

            } else {
                copy = ht.copy;
            }
        } else {

            copy = "Missing copy for:\n" + objectLabel;
        }

        this.currentHitText = new Model(this.renderer, "text_" + objectLabel, false);

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
        let align = TEXT_ALIGN.LEFT;
        let offset = 0.5;
        let d = 0.8
        if (ht && ht.subtitle) {
            align = TEXT_ALIGN.CENTER;
            offset = 0;
            this.hitTextTarget.y = -0.5;
            this.hitTextTarget.x = 0;
            this.hitTextTarget.z = 0;
        } else {
            this.hitTextTarget = GameModel.characterPos.clone()
            let p = GameModel.gameCamera.getScreenPos(this.hitTextTarget.clone())
            let p2 = GameModel.gameCamera.getScreenPos(this.hitTextTarget.clone().add([0, 1, 0]))
            d = 0.50 / (p.distance(p2 as NumericArray));


            if (p.x > 0 && !this.keepRight) {
                align = TEXT_ALIGN.RIGHT;
                offset = -0.5;
            }

            this.hitTextTarget.y = -1.5 + 2.0 + this.adj;
            this.hitTextTarget.x += offset * 0.8;
        }

        this.hitTextAlpha = 0;


        gsap.to(this.hitTextTarget, {x: this.hitTextTarget.x + offset * 0.2, ease: "expo.out", duration: 0.5})
        gsap.to(this, {hitTextAlpha: 1, duration: 0.5})

        this.currentHitText.mesh = this.font.getMesh(copy, align, 0.5);
        this.numChars = this.currentHitText.mesh.numIndices / 6;

        this.showChars = Math.min(10, this.numChars)
        if (this.numChars > 10) {

            gsap.to(this, {showChars: this.numChars, ease: "none", duration: (this.numChars - 10) / 90})
        }
        if (GameModel.screenHeight > 800) d *= 800 / GameModel.screenHeight;
        this.currentHitText.setScale(d, d, d);
        this.fontMeshRenderer.addText(this.currentHitText);
        this.update();
        return multiline;
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
        GameModel.sound.playClick(0.2)
        let ht = this.hitTriggerByLabel[this.objectLabel];
        if (!ht) {
            this.hideHitTrigger();
            return true;
        }
        if (isArray(ht.copy)) {


            if (ht.random) {
                this.hideHitTrigger();
                return true;
            }
            if (ht.count == 0) {
                this.hideHitTrigger();
                return true;
            }


        } else {
            this.hideHitTrigger();
            return true
        }

        this.showHitTrigger(this.objectLabel, this.keepRight, this.adj)

        return false;
    }
}

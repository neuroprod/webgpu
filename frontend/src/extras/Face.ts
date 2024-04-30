import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import GBufferFaceShader from "../shaders/GbufferFaceShader";
import UI from "../lib/UI/UI";
import {Vector4} from "math.gl";
import Timer from "../lib/Timer";
import gsap from "gsap";

export default class Face {
    private model: Model;
    private material: Material;

    private eyeLeft: Vector4 = new Vector4()
    private eyeRight: Vector4 = new Vector4()
    private pupilLeft: Vector4 = new Vector4()
    private pupilRight: Vector4 = new Vector4()
    private mouthLeft: Vector4 = new Vector4()
    private mouthRight: Vector4 = new Vector4()


    private eyeLeftBase: Vector4;
    private eyeRightBase: Vector4;
    private pupilLeftBase: Vector4;
    private pupilRightBase: Vector4;
    private mouthLeftBase: Vector4;
    private mouthRightBase: Vector4;
    private blink: number = -1;
    private nextBlink: number = 0;
    private nextEyeMove = 2;
    isRandom: boolean = true;

    constructor(renderer, faceModel: Model) {

        this.model = faceModel;
        this.material = new Material(renderer, "face", new GBufferFaceShader(renderer, "faceshader"))
        this.material.skin = this.model.material.skin;
        this.model.material = this.material;
        this.model.castShadow = false;


        this.eyeLeftBase = new Vector4(0.61, 0.34, 0.1);
        this.eyeRightBase = new Vector4(0.38, 0.32, 0.1);
        this.pupilLeftBase = new Vector4(0.39, 0.34, 0.03);
        this.pupilRightBase = new Vector4(0.63, 0.352, 0.03);
        this.mouthLeftBase = new Vector4(0.420, 0.493, 0.022, 0.000);
        this.mouthRightBase = new Vector4(0.56, 0.51, 0.02);
        this.setToBlink()
        this.setToBase()

    }

    setToBase() {
        this.eyeLeft.from(this.eyeLeftBase)
        this.eyeRight.from(this.eyeRightBase)
        this.pupilLeft.from(this.pupilLeftBase)
        this.pupilRight.from(this.pupilRightBase)
        this.mouthLeft.from(this.mouthLeftBase)
        this.mouthRight.from(this.mouthRightBase)
    }

    setToBlink() {
        this.eyeLeft.z = 0
        this.eyeRight.z = 0
        this.pupilLeft.z = 0
        this.pupilRight.z = 0
        this.blink = 0.05;
        this.nextBlink = Math.random() * 3 + 5;

    }

    private lookRandom() {
        let hor = (Math.random() - 0.5) * 0.1;

        this.pupilLeft.from(this.pupilLeftBase)
        this.pupilRight.from(this.pupilRightBase)
        if (Math.random() > 0.2) hor = 0;

        this.pupilLeft.x += hor;
        this.pupilRight.x += hor;
        this.nextEyeMove = 0.3 + Math.random() * 3;
    }

    stopBlink() {
        this.eyeLeft.z = this.eyeLeftBase.z;
        this.eyeRight.z = this.eyeRightBase.z;
        this.pupilLeft.z = this.pupilLeftBase.z;
        this.pupilRight.z = this.pupilRightBase.z;
        this.blink = -1;
    }

    onUI() {
        UI.pushWindow("Face")
        if (UI.LButton("base")) {
            this.setToBase()
        }
        if (UI.LButton("blink")) {
            this.setToBlink()
        }
        if (UI.LButton("intro")) {
            this.setToIntro()
        }
        this.isRandom = UI.LBool("random", this.isRandom);

        UI.floatPrecision = 3
        UI.LVector("eyeLeft", this.eyeLeft)
        UI.LVector("eyeRight", this.eyeRight)
        UI.LVector("pupilLeft", this.pupilLeft)
        UI.LVector("pupilRight", this.pupilRight)
        UI.LVector("mouthLeft", this.mouthLeft)
        UI.LVector("mouthRight", this.mouthRight)
        UI.floatPrecision = 2
        UI.popWindow()
    }

    update() {


        this.nextBlink -= Timer.delta;
        if (this.nextBlink < 0) {
            this.setToBlink()
        }
        if (this.blink > 0) {
            this.blink -= Timer.delta;
            if (this.blink <= 0) {
                this.stopBlink()
            }
        }

        if (this.isRandom) {
            this.nextEyeMove -= Timer.delta
            if (this.nextEyeMove < 0) {
                this.lookRandom();
            }

        }


        this.model.material.uniforms.setUniform("eyeLeft", this.eyeLeft);
        this.model.material.uniforms.setUniform("eyeRight", this.eyeRight);
        this.model.material.uniforms.setUniform("pupilLeft", this.pupilLeft);
        this.model.material.uniforms.setUniform("pupilRight", this.pupilRight);
        this.model.material.uniforms.setUniform("mouthLeft", this.mouthLeft);
        this.model.material.uniforms.setUniform("mouthRight", this.mouthRight);

    }


    private setToIntro() {

        this.setToBase()
        this.pupilLeft.y = 0.331;
        this.pupilRight.y = 0.347;
        this.pupilRight.x = 0.619;
    }

    lookDown() {
        this.isRandom = false;
        this.setToBase()
        this.pupilLeft.y = 0.364;
        this.pupilRight.y = 0.38;
    }

    lookGold() {
        gsap.to(this.pupilLeft, {y: 0.3, x: 0.371, delay: 1})
        gsap.to(this.pupilRight, {y: 0.325, x: 0.587, delay: 1})
        this.isRandom = false;
        gsap.delayedCall(3, () => {
            this.setToIntro()
            this.isRandom = true;
        })
    }
}

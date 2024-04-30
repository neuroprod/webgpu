import {NumericArray, Quaternion, Vector3} from "math.gl";
import Renderer from "./lib/Renderer";
import Camera from "./lib/Camera";
import AnimationMixer from "./lib/animation/AnimationMixer";
import Object3D from "./lib/core/Object3D";


import gsap from "gsap";
import Timeline from "gsap";

import GameModel, {Scenes} from "../public/GameModel";
import GLFTLoader from "./GLFTLoader";


import Material from "./lib/core/Material";
import Model from "./lib/model/Model";
import Face from "./extras/Face";


export default class CharacterHandler {
    characterRot: number = 0;
    body: Model;
    isWalking: boolean = false;
    face: Face;
    /// public floorHitIndicator: FloorHitIndicator;
    private renderer: Renderer;
    private camera: Camera;
    private animationMixer: AnimationMixer;
    private characterRoot: Object3D;
    private root: Object3D
    // @ts-ignore
    private tl: Timeline;
    private scene: number = 0;
    private targetPos: Vector3 = new Vector3();
    private pants: Material;
    private walkingSpeed: number = 0.72;
    private charScale: number = 1;
    private rotateLerp = 0;
    private rotateStart: Quaternion = new Quaternion()
    private rotateTarget: Quaternion = new Quaternion()
    private rotateCurr: Quaternion = new Quaternion()
    private targetRot: number = 0;

    constructor(renderer: Renderer, camera: Camera, glft: GLFTLoader, animationMixer: AnimationMixer) {

        this.renderer = renderer;
        this.camera = camera;
        this.animationMixer = animationMixer;
        this.characterRoot = glft.root;
        this.body = glft.modelsByName["body"];
        this.face = new Face(renderer, glft.modelsByName["face"]);
        this.body.mesh.max.set(30, 30, 0)
        this.body.mesh.min.set(-30, -30, -220)


        this.pants = glft.materialsByName["pants"]

        this.animationMixer.setAnimation("idle");
        this.characterRoot.setPosition(GameModel.characterPos.x, GameModel.characterPos.y, GameModel.characterPos.z)


    }

    setRoot(r: Object3D, scene: number) {
        this.scene = scene;
        this.root = r;
        this.root.addChild(this.characterRoot)

    }

    update() {
        this.face.update()
        this.animationMixer.update();
        if (GameModel.currentScene == Scenes.ROOM) {
            this.charScale = 1.05;

        } else {
            this.charScale = 1.00;
        }
        this.walkingSpeed = 0.6 / this.charScale
        //  this.head.setEuler(Timer.time*7,0,0);


        this.characterRoot.setScale(this.charScale, this.charScale, this.charScale)
        this.characterRoot.setPosition(GameModel.characterPos.x, GameModel.characterPos.y, GameModel.characterPos.z)

        this.rotateCurr.slerp(this.rotateStart as NumericArray, this.rotateTarget as NumericArray, this.rotateLerp);

        this.characterRoot.setRotationQ(this.rotateCurr)


    }

    public walkTo(target: Vector3, targetRot = 0, completeCall: () => any = () => {
    }, keepWalking: boolean = false) {

        this.targetRot = targetRot;
        this.targetPos.from(target);
        this.targetPos.y = 0;
        if (this.tl) this.tl.clear()
        this.tl = gsap.timeline({
            onComplete: () => {

                completeCall()
                GameModel.stopWalking()
            }
        });

        if (this.isWalking == false) {
            this.startWalking(keepWalking)
        } else {
            this.continueWalking(keepWalking)
        }

    }

    public setPants(id: number) {
        let name = "";
        if (id == 1) {
            name = "Army"
        } else if (id == 2) {
            name = "Girl"
        } else if (id == 3) {
            name = "Grandpa"
        } else if (id == 4) {
            name = "Glow"
        } else if (id == 5) {
            name = "Fasion"
        } else if (id == 6) {
            name = "Gold"
        }
        this.pants.uniforms.setTexture("colorTexture", this.renderer.texturesByLabel["textures/pants" + name + "_Color.webp"])
        this.pants.uniforms.setTexture("normalTexture", this.renderer.texturesByLabel["textures/pants" + name + "_Normal.webp"])
        this.pants.uniforms.setTexture("mraTexture", this.renderer.texturesByLabel["textures/pants" + name + "_MRA.webp"])


    }

    public setAnimation(name: string, speed: number = 0.5, delay: number = 0) {
        if (this.tl) this.tl.clear()
        this.tl = gsap.timeline();
        this.tl.call(() => {
            this.animationMixer.setAnimation(name, 0);
            this.isWalking = false
        }, [], delay)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: speed, ease: "none"}, delay)
    }

    public startWalking(keepWalking: boolean = false) {
        let pos = 0
        let dist = GameModel.characterPos.distance(this.targetPos);
        let dir = this.targetPos.clone().subtract(GameModel.characterPos)
        let angle = Math.atan2(dir.x, dir.z);


        this.tl.call(() => {
            this.animationMixer.setAnimation("walking", 0)  , this.isWalking = true
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "power1.inOut"}, pos)
        this.tl.call(this.rotateTo.bind(this), [angle, 0.5], pos)
        // this.tl.to(this, {"characterRot": angle, duration: 0.5, ease: "none"}, pos)

        pos += 0.3;
        let duration = dist * this.walkingSpeed;
        this.tl.to(GameModel.characterPos, {
            "x": this.targetPos.x,
            "y": this.targetPos.y,
            "z": this.targetPos.z,
            duration: duration,
            ease: "none"
        }, pos)

        if (keepWalking) return;

        pos += duration;
        let nextAnime = "idle"

        this.tl.call(() => {
            this.animationMixer.setAnimation(nextAnime, 0);
            this.isWalking = false
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "none"}, pos)

        this.tl.call(this.rotateTo.bind(this), [this.targetRot, 0.5], pos)

    }

    startTyping() {
        this.setAnimation("typing")
    }

    sit() {
        this.setAnimation("sit")
    }

    continueWalking(keepWalking: boolean = false) {
        let pos = 0
        let dist = GameModel.characterPos.distance(this.targetPos);
        let dir = this.targetPos.clone().subtract(GameModel.characterPos)
        let angle = Math.atan2(dir.x, dir.z);

        if (this.animationMixer.mixValue != 1) {

            this.tl.to(this.animationMixer, {
                "mixValue": 1,
                duration: 0.5 * (1.0 - this.animationMixer.mixValue),
                ease: "power1.inOut"
            }, pos)
        }

        //this.tl.to(this, {"characterRot": angle, duration: 0.5, ease: "power1.inOut"}, pos)
        this.tl.call(this.rotateTo.bind(this), [angle, 0.5], pos)
        let duration = dist * this.walkingSpeed;
        this.tl.to(GameModel.characterPos, {
            "x": this.targetPos.x,
            "y": this.targetPos.y,
            "z": this.targetPos.z,
            duration: duration,
            ease: "none"
        }, pos)

        if (keepWalking) return;

        pos += duration;
        let nextAnime = "idle"

        this.tl.call(() => {
            this.animationMixer.setAnimation(nextAnime, 0);
            this.isWalking = false
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "none"}, pos)

        this.tl.call(this.rotateTo.bind(this), [this.targetRot, 0.5], pos)

    }

    pullPants() {
        this.rotateTo(0, 0.1);
        this.setAnimationOnce("pullPants", 0.2, () => {

            this.setIdleAndTurn()
        })


    }

    setIdleAndTurn(angle = 0) {

        if (this.animationMixer.anime2.label == "idle" && this.animationMixer.mixValue == 1 && this.targetRot == 0) return;

        this.setAnimation("idle", 0.5, 0.0);
        this.tl.call(this.rotateTo.bind(this), [angle, 0.5], 0)


    }

    setMixAnimation(anime: string, value: number, time: number, animationComplete: () => any = () => {
    }) {
        let animation = this.animationMixer.animationsByName[anime];
        gsap.killTweensOf(animation)
        gsap.to(animation, {mixValue: value, duration: time, ease: "power2.Out", onComplete: animationComplete})
    }

    rotate(angle: number) {
        this.rotateTo(angle, 0)
    }

    setAnimationOnce(animation: string, fade: number, oncomplete: () => void) {
        if (this.tl) this.tl.clear()
        this.tl = gsap.timeline();
        this.animationMixer.setAnimationOnce(animation, oncomplete);
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: fade, ease: "none"}, 0)
    }

    private rotateTo(angle: number, time: number) {

        this.targetRot = angle;
        this.rotateStart.from(this.characterRoot.getRotation());
        this.rotateTarget.identity();
        this.rotateTarget.rotateY(angle);

        gsap.killTweensOf(this, "rotateLerp");
        this.rotateLerp = 0
        gsap.to(this, {rotateLerp: 1, duration: time});

    }
}

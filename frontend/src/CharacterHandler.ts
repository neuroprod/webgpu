import {Vector2, Vector3, Vector4} from "math.gl";
import Renderer from "./lib/Renderer";
import Camera from "./lib/Camera";
import AnimationMixer from "./lib/animation/AnimationMixer";
import Object3D from "./lib/core/Object3D";
import {FloorHitIndicator} from "./extras/FloorHitIndicator";

import gsap from "gsap";
import Timeline from "gsap";
import Main from "./Main";
import GameModel, {Scenes, Transitions} from "./GameModel";


export default class CharacterHandler {
   /// public floorHitIndicator: FloorHitIndicator;
    private renderer: Renderer;
    private camera: Camera;
    private animationMixer: AnimationMixer;
    private characterRoot: Object3D;
    private floorHit: boolean = false;

    private up: Vector3 = new Vector3(0, 1, 0);
    private floorPlane: Vector3 = new Vector3(0, -1.5, 0);

    private root: Object3D


    // @ts-ignore
    private tl: Timeline;
    characterRot: number = 0;
    private targetOffset = 0;
    private offset = 0;
    private scene: number = 0;
    private main: Main;
    private isWalking: boolean = false;
    private targetPos: Vector3 =new Vector3();

    constructor(renderer: Renderer, camera: Camera, characterRoot: Object3D, animationMixer: AnimationMixer) {

        this.renderer = renderer;
        this.camera = camera;
        this.animationMixer = animationMixer;
        this.characterRoot = characterRoot;
        this.animationMixer.setAnimation("idle");
        this.characterRoot.setPosition(GameModel.characterPos.x, GameModel.characterPos.y, GameModel.characterPos.z)


    }

    setRoot(r: Object3D, scene: number) {
        this.scene = scene;
        this.root = r;
        this.root.addChild(this.characterRoot)

    }

    update(mousePos: Vector2, down: boolean) {

        this.animationMixer.update();
        this.characterRoot.setPosition(GameModel.characterPos.x, GameModel.characterPos.y, GameModel.characterPos.z)
        this.characterRoot.setEuler(0, this.characterRot, 0)



    }

    public walkTo(target:Vector3,lookAt:Vector3,completeCall:() => any=()=>{},keepWalking:boolean=false){

        this.targetPos.from(target);
        this.targetPos.y=0;
        if (this.tl) this.tl.clear()
        this.tl = gsap.timeline({onComplete:()=>{

                completeCall()
            }});

        if (this.isWalking == false) {
            this.startWalking(keepWalking)
        } else {
            this.continueWalking(keepWalking)
        }
    }
    public startWalking(keepWalking:boolean=false) {
        let pos = 0
        let dist = GameModel.characterPos.distance(this.targetPos);
        let dir = this.targetPos.clone().subtract(GameModel.characterPos)
        let angle = Math.atan2(dir.x, dir.z);

        this.tl.call(() => {
            this.animationMixer.setAnimation("walking", 0)  , this.isWalking = true
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "power1.inOut"}, pos)
        this.tl.to(this, {"characterRot": angle, duration: 0.5, ease: "none"}, pos)

        pos += 0.3;
        let duration = dist * 0.75;
        this.tl.to(GameModel.characterPos, {
            "x": this.targetPos.x,
            "y": this.targetPos.y,
            "z": this.targetPos.z,
            duration: duration,
            ease: "none"
        }, pos)

        if(keepWalking)return;

        pos += duration;
        let nextAnime = "idle"

        this.tl.call(() => {
            this.animationMixer.setAnimation(nextAnime, 0);
            this.isWalking = false
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "none"}, pos)
        this.tl.to(this, {"characterRot": 0, duration: 0.5, ease: "power1.inOut"}, pos)
    }




    private continueWalking(keepWalking:boolean=false) {
        let pos = 0
        let dist = GameModel.characterPos.distance(this.targetPos);
        let dir = this.targetPos.clone().subtract(GameModel.characterPos)
        let angle = Math.atan2(dir.x, dir.z);


        this.tl.to(this, {"characterRot": angle, duration: 0.5, ease: "power1.inOut"}, pos)

        let duration = dist * 0.75;
        this.tl.to(GameModel.characterPos, {
            "x": this.targetPos.x,
            "y": this.targetPos.y,
            "z": this.targetPos.z,
            duration: duration,
            ease: "none"
        }, pos)

        if(keepWalking)return;

        pos += duration;
        let nextAnime = "idle"

        this.tl.call(() => {
            this.animationMixer.setAnimation(nextAnime, 0);
            this.isWalking = false
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "none"}, pos)
        this.tl.to(this, {"characterRot": 0, duration: 0.5, ease: "none"}, pos)
    }
}

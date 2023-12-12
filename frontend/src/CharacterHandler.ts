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
    public floorHitIndicator: FloorHitIndicator;
    private renderer: Renderer;
    private camera: Camera;
    private animationMixer: AnimationMixer;
    private characterRoot: Object3D;
    private floorHit: boolean = false;
    private floorPos: Vector3 = new Vector3(0, -1.5, 0);
    private up: Vector3 = new Vector3(0, 1, 0);
    private floorPlane: Vector3 = new Vector3(0, -1.5, 0);

    private root: Object3D


    // @ts-ignore
    private tl: Timeline;
    private characterRot: number = 0;
    private targetOffset = 0;
    private offset = 0;
    private scene: number = 0;
    private main: Main;
    private isWalking: boolean = false;

    constructor(renderer: Renderer, camera: Camera, characterRoot: Object3D, animationMixer: AnimationMixer) {

        this.renderer = renderer;
        this.camera = camera;
        this.animationMixer = animationMixer;
        this.characterRoot = characterRoot;
        this.animationMixer.setAnimation("idle");
        this.characterRoot.setPosition(GameModel.characterPos.x, GameModel.characterPos.y, GameModel.characterPos.z)
        this.floorHitIndicator = new FloorHitIndicator(this.renderer)

    }

    setRoot(r: Object3D, scene: number) {
        this.scene = scene;
        this.root = r;
        this.root.addChild(this.characterRoot)
        this.root.addChild(this.floorHitIndicator)


        if (scene == 0) {
            GameModel.characterPos.set(-this.renderer.ratio * 3 / 2 + 0.3, 0, -1.5)
            this.floorPos.set(0, 0, -1.5)
            this.moveCharToFloorHit()

        } else {
           GameModel.characterPos.set(-1.512388, 0, -4.69928)
            this.floorPos.set(-2.5, 0, -1.9)
            this.moveCharToFloorHit()
        }
        //this.moveCharToFloorHit()
    }

    update(mousePos: Vector2, down: boolean) {


        this.setMouseFloorPos(mousePos.clone());
        let screen = this.characterRoot.getWorldPos().x - this.root.getPosition().x;




        if (GameModel.currentScene == Scenes.ROOM) {
            if(GameModel.isLeftRoom){
                if (screen - 0.2 < -this.renderer.ratio * 3 / 2) {
                    GameModel.setTransition(Transitions.GO_OUTSIDE)
                }
                if (screen  > this.renderer.ratio * 3 / 2+0.15) {
                    GameModel.setTransition(Transitions.GO_RIGHT_ROOM)
                }
            }
            else if(!GameModel.isLeftRoom){
                if (screen  < this.renderer.ratio * 3 / 2+0.15) {
                    GameModel.setTransition(Transitions.GO_LEFT_ROOM)

                }
            }
        }
        else if (GameModel.currentScene == Scenes.OUTSIDE) {
            let distToDoor = (this.characterRoot.getWorldPos().subtract(this.root.getPosition()).distance(new Vector3(-1.305644, 0, -5.052313)))

           if (distToDoor < 0.3){  GameModel.setTransition(Transitions.GO_INSIDE)}
        }
        this.offset += (this.targetOffset - this.offset) / 20;

        this.root.setPosition(0, -1.5, 0)

        if (this.floorHit) {
            //  this.characterRoot.setPosition(this.floorPos.x,this.floorPos.y,this.floorPos.z)

            this.floorHitIndicator.setPosition(this.floorPos.x, this.floorPos.y + 0.01, this.floorPos.z)
            if (down) {

                this.moveCharToFloorHit()

            }
        }
        this.floorHitIndicator.visible = this.floorHit

        this.animationMixer.update();
        this.characterRoot.setPosition(GameModel.characterPos.x, GameModel.characterPos.y, GameModel.characterPos.z)
        this.characterRoot.setEuler(0, this.characterRot, 0)

    }

    public startWalking() {
        let pos = 0
        let dist = GameModel.characterPos.distance(this.floorPos);
        let dir = this.floorPos.clone().subtract(GameModel.characterPos)
        let angle = Math.atan2(dir.x, dir.z);

        this.tl.call(() => {
            this.animationMixer.setAnimation("walking", 0)  , this.isWalking = true
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "power1.inOut"}, pos)
        this.tl.to(this, {"characterRot": angle, duration: 0.5, ease: "none"}, pos)

        pos += 0.3;
        let duration = dist * 0.75;
        this.tl.to(GameModel.characterPos, {
            "x": this.floorPos.x,
            "y": this.floorPos.y,
            "z": this.floorPos.z,
            duration: duration,
            ease: "none"
        }, pos)

        pos += duration;
        let nextAnime = "idle"
        if (Math.random() > 0.7) nextAnime = "bored"
        this.tl.call(() => {
            this.animationMixer.setAnimation(nextAnime, 0);
            this.isWalking = false
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "none"}, pos)
        this.tl.to(this, {"characterRot": 0, duration: 0.5, ease: "power1.inOut"}, pos)
    }

    private setMouseFloorPos(mousePos: Vector2) {
        let posFloor = this.root.getPosition();
        this.floorPlane.set(posFloor.x, posFloor.y, posFloor.z);

        mousePos.scale(new Vector2(2 / (this.renderer.width / this.renderer.pixelRatio), 2 / (this.renderer.height / this.renderer.pixelRatio)))
        let pos = new Vector4(mousePos.x - 1, (mousePos.y - 1) * -1, 1, 1);
        if (this.camera.viewProjectionInv) {
            pos.transform(this.camera.viewProjectionInv);
            let rayStart = this.camera.cameraWorld.clone()
            let rayDir = new Vector3(pos.x - rayStart.x, pos.y - rayStart.y, pos.z - rayStart.z).normalize()


            let denom = this.up.dot(rayDir);
            if (Math.abs(denom) > 0.01) // your favorite epsilon
            {

                let t = (this.floorPlane.clone().subtract(rayStart)).dot(this.up) / denom;
                if (t < 0) {
                    this.floorHit = false;
                    return;
                } else {
                    rayDir.scale(t);
                    rayStart.add(rayDir);
                    if (rayStart.z < -6) {
                        this.floorHit = false;
                        return;
                    }
                    this.floorHit = true;
                    this.floorPos = rayStart.clone().subtract(posFloor)

                }


            } else {
                this.floorHit = false;
            }


        }
    }

    private moveCharToFloorHit() {


        if (this.tl) this.tl.clear()
        this.tl = gsap.timeline({});
        if (this.isWalking == false) {
            this.startWalking()
        } else {
            this.continueWalking()
        }

    }

    private continueWalking() {
        let pos = 0
        let dist = GameModel.characterPos.distance(this.floorPos);
        let dir = this.floorPos.clone().subtract(GameModel.characterPos)
        let angle = Math.atan2(dir.x, dir.z);


        this.tl.to(this, {"characterRot": angle, duration: 0.5, ease: "power1.inOut"}, pos)

        let duration = dist * 0.75;
        this.tl.to(GameModel.characterPos, {
            "x": this.floorPos.x,
            "y": this.floorPos.y,
            "z": this.floorPos.z,
            duration: duration,
            ease: "none"
        }, pos)

        pos += duration;
        let nextAnime = "idle"
        if (Math.random() > 0.7) nextAnime = "bored"
        this.tl.call(() => {
            this.animationMixer.setAnimation(nextAnime, 0);
            this.isWalking = false
        }, [], pos)
        this.tl.to(this.animationMixer, {"mixValue": 1, duration: 0.5, ease: "none"}, pos)
        this.tl.to(this, {"characterRot": 0, duration: 0.5, ease: "none"}, pos)
    }
}

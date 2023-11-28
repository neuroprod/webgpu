import {Vector2, Vector3, Vector4} from "math.gl";
import Renderer from "./lib/Renderer";
import Camera from "./lib/Camera";
import AnimationMixer from "./lib/animation/AnimationMixer";
import Object3D from "./lib/core/Object3D";
import {FloorHitIndicator} from "./extras/FloorHitIndicator";

import gsap from "gsap";
import Timeline from "gsap";



export default class CharacterHandler {
    private renderer: Renderer;
    private camera: Camera;
    private animationMixer: AnimationMixer;
    private characterRoot: Object3D;
    private floorHit: boolean =false;
    private floorPos:Vector3 =new Vector3(0,-1.5,0);
    private up:Vector3 =new Vector3(0,1,0);
    private floorPlane:Vector3 =new Vector3(0,-1.5,0);
    public floorHitIndicator: FloorHitIndicator;

    private charPos:Vector3  =new Vector3(1,-1.5,-1);
    // @ts-ignore
    private tl :Timeline;
    private characterRot: number =0;
    constructor(renderer: Renderer, camera: Camera, characterRoot:Object3D, animationMixer: AnimationMixer) {
        this.renderer = renderer;
        this.camera = camera;
        this.animationMixer = animationMixer;
        this.characterRoot =characterRoot;
        this.animationMixer.setAnimation("idle");
        this.characterRoot.setPosition(this.charPos.x,this.charPos.y,this.charPos.z)
        this.floorHitIndicator =new FloorHitIndicator(this.renderer)
    }

    update(mousePos: Vector2, down: boolean) {

        this.setMouseFloorPos(mousePos.clone());

        if(this.floorHit){
          //  this.characterRoot.setPosition(this.floorPos.x,this.floorPos.y,this.floorPos.z)

            this.floorHitIndicator.setPosition(this.floorPos.x,this.floorPos.y+0.01,this.floorPos.z)
            if(down){
                this.moveCharToFloorHit()

            }
        }
        this.floorHitIndicator.visible =this.floorHit

        this.animationMixer.update();
        this.characterRoot.setPosition(this.charPos.x,this.charPos.y,this.charPos.z)
        this.characterRoot.setEuler(0,this.characterRot,0)

    }

    private setMouseFloorPos(mousePos: Vector2) {
        mousePos.scale(new Vector2(2 / (this.renderer.width / this.renderer.pixelRatio), 2 / (this.renderer.height / this.renderer.pixelRatio)))
        let pos = new Vector4(mousePos.x - 1, (mousePos.y - 1)*-1, 1, 1);
        if (this.camera.viewProjectionInv) {
            pos.transform(this.camera.viewProjectionInv);
            let rayStart = this.camera.cameraWorld.clone()
            let rayDir = new Vector3(pos.x-rayStart.x, pos.y-rayStart.y, pos.z-rayStart.z).normalize()


            let denom = this.up.dot(rayDir);
            if (Math.abs(denom) > 0.01) // your favorite epsilon
            {

                let t = (this.floorPlane.clone().subtract(rayStart)).dot(this.up) / denom;
                if (t < 0) {
                    this.floorHit =false;
                    return;
                } else {
                    rayDir.scale(t);
                    rayStart.add(rayDir);
                    if ( rayStart.z<-3){
                        this.floorHit =false;
                        return;
                    }
                    this.floorHit =true;
                    this.floorPos = rayStart.clone()

                }


            } else {
                this.floorHit =false;
            }


        }
    }

    private moveCharToFloorHit() {
        let dist =this.charPos.distance(this.floorPos);

        let dir = this.floorPos.clone().subtract(this.charPos)

        let angle = Math.atan2(dir.x,dir.z);
        if(this.tl)this.tl.clear()
        this.tl = gsap.timeline({});
        let pos =0

       this.tl.call(()=>{ this.animationMixer.setAnimation("walking",0)    },[],pos)
        this.tl.to(this.animationMixer,{"mixValue":1,duration:0.5,ease: "none"},pos)
        this.tl.to(this,{"characterRot":angle,duration:0.5,ease: "none"},pos)

        pos+=0.3;
        let duration =dist*0.75;
      this.tl.to(this.charPos,{"x":this.floorPos.x,"y":this.floorPos.y,"z":this.floorPos.z,duration:duration ,ease: "none"},pos)

        pos+=duration;

      this.tl.call(()=>{ this.animationMixer.setAnimation("idle",0);},[],pos)
        this.tl.to(this.animationMixer,{"mixValue":1,duration:0.5,ease: "none"},pos)
       this.tl.to(this,{"characterRot":0 ,duration:0.5,ease: "none"},pos)

    }
}

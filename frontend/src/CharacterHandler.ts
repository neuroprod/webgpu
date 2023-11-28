import {Vector2, Vector3, Vector4} from "math.gl";
import Renderer from "./lib/Renderer";
import Camera from "./lib/Camera";
import AnimationMixer from "./lib/animation/AnimationMixer";
import Object3D from "./lib/core/Object3D";



export default class CharacterHandler {
    private renderer: Renderer;
    private camera: Camera;
    private animationMixer: AnimationMixer;
    private characterRoot: Object3D;
    private floorHit: boolean =false;
    private floorPos:Vector3 =new Vector3(0,-1.5,0);
    private up:Vector3 =new Vector3(0,1,0);
    private floorPlane:Vector3 =new Vector3(0,-1.5,0);
    constructor(renderer: Renderer, camera: Camera, characterRoot:Object3D, animationMixer: AnimationMixer) {
        this.renderer = renderer;
        this.camera = camera;
        this.animationMixer = animationMixer;
        this.characterRoot =characterRoot;

        this.characterRoot.setPosition(this.floorPos.x,this.floorPos.y,this.floorPos.z)
    }

    update(mousePos: Vector2, down: boolean) {

        this.setMouseFloorPos(mousePos.clone());

        if(this.floorHit){
            this.characterRoot.setPosition(this.floorPos.x,this.floorPos.y,this.floorPos.z)
        }
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
}

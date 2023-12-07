import Camera from "./lib/Camera";
import {Vector2, Vector3} from "math.gl";
import Renderer from "./lib/Renderer";
import GameModel, {Scenes} from "./GameModel";

export default class GameCamera{
    private camera: Camera;
    private mouseTarget = new Vector2()
    private renderer: Renderer;
    public posSmooth=0;
    constructor(camera:Camera,renderer:Renderer){
        this.camera =camera;
        this.renderer =renderer;


    }
    public update(){
        let mp = GameModel.mousePos.clone()
        mp.scale(new Vector2(1 / (this.renderer.width / this.renderer.pixelRatio), 1 / (this.renderer.height / this.renderer.pixelRatio)))

        mp.x -= 0.5
        mp.x *= 2.0;

        mp.y -= 0.5
        mp.y *= GameModel.yMouseScale;



        let offsetX = this.getCameraOffsetX();




        this.mouseTarget.lerp(mp, 0.1);
        let cameraPositionMap = new Vector3(-this.mouseTarget.x * 2.0, GameModel.yMouseCenter + this.mouseTarget.y, 10);
        this.camera.cameraWorld = cameraPositionMap.clone();
        this.camera.cameraWorld.x+=offsetX
        //this.camera.cameraWorld.y-=1.5;
        this.camera.cameraLookAt = new Vector3(cameraPositionMap.x+offsetX, cameraPositionMap.y, 0);
        let screenLocal = new Vector2(this.renderer.ratio * GameModel.sceneHeight,GameModel.sceneHeight)

        this.camera.fovy = Math.atan2(screenLocal.y / 2, cameraPositionMap.z) * 2;

        this.camera.ratio = this.renderer.ratio;

        this.camera.lensShift.x = -cameraPositionMap.x / (screenLocal.x / 2);
        this.camera.lensShift.y = -cameraPositionMap.y / (screenLocal.y / 2);
    }

    private getCameraOffsetX() {


        if(GameModel.currentScene ==Scenes.ROOM){
            return 0
        }
        let halfWidth = this.renderer.ratio * GameModel.sceneHeight/2;

        let pos = Math.min(GameModel.characterPos.x,-halfWidth);
        pos = Math.max( pos,-27+halfWidth);
        let step =(pos-this.posSmooth)/30;
        if(Math.abs(step)<0.001)step =0;
        this.posSmooth+=step;
        return this.posSmooth;
    }

    setOutsidePos() {
          let halfWidth = this.renderer.ratio * GameModel.sceneHeight/2;
        this.posSmooth=-halfWidth;
    }
}
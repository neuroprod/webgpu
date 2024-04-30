import Camera from "./lib/Camera";
import {Vector2, Vector3} from "math.gl";
import Renderer from "./lib/Renderer";
import GameModel, {Scenes, StateGold} from "../public/GameModel";
import Timer from "./lib/Timer";

export default class GameCamera {
    private camera: Camera;
    private mouseTarget = new Vector2(-1, -0.5)
    private renderer: Renderer;
    public posSmooth = 0;
    public offsetX: number;
    public first: number = 0;

    constructor(camera: Camera, renderer: Renderer) {
        this.camera = camera;
        this.renderer = renderer;

        this.camera.near = 8

    }

    public update() {
        let mp = GameModel.mousePos.clone()
        if (mp.x < 0) {
            mp.x = window.innerWidth / 2
            mp.y = window.innerHeight / 2
        }


        mp.scale(new Vector2(1 / (this.renderer.width / this.renderer.pixelRatio), 1 / (this.renderer.height / this.renderer.pixelRatio)))

        mp.x -= 0.5
        mp.x *= 2.0;

        mp.y -= 0.5
        mp.y *= GameModel.yMouseScale;
        if (GameModel.currentScene == Scenes.PRELOAD) {
            mp.scale(0.7);
        }
        if (GameModel.stateGold == StateGold.OUTRO) {
            mp.scale(0.2);
        }
        this.offsetX = this.getCameraOffsetX();


        let L = 1 - Math.pow(0.01, Timer.delta)
        this.mouseTarget.lerp(mp, L);
        if (this.first < 10) this.mouseTarget.from(mp);
        this.first++;
        let cameraPositionMap = new Vector3(-this.mouseTarget.x * 2.0, GameModel.yMouseCenter + this.mouseTarget.y, 10);
        this.camera.cameraWorld = cameraPositionMap.clone();
        this.camera.cameraWorld.x += this.offsetX
        this.camera.cameraWorld.y += GameModel.offsetY
        //this.camera.cameraWorld.y-=1.5;
        this.camera.cameraLookAt = new Vector3(cameraPositionMap.x + this.offsetX, cameraPositionMap.y + GameModel.offsetY, 0);
        let screenLocal = new Vector2(this.renderer.ratio * GameModel.sceneHeight, GameModel.sceneHeight)

        this.camera.fovy = Math.atan2(screenLocal.y / 2, cameraPositionMap.z) * 2;

        this.camera.ratio = this.renderer.ratio;

        this.camera.lensShift.x = -cameraPositionMap.x / (screenLocal.x / 2);
        this.camera.lensShift.y = -cameraPositionMap.y / (screenLocal.y / 2);
    }

    private getCameraOffsetX() {

        if (GameModel.stateGold == StateGold.GET_GOLD) return -24.8;
        if (GameModel.currentScene == Scenes.ROOM || GameModel.currentScene == Scenes.PRELOAD) {

            return GameModel.roomCamOffset * (this.renderer.ratio * GameModel.sceneHeight / 2 + 0.15);
        }
        let halfWidth = this.renderer.ratio * GameModel.sceneHeight / 2;

        let pos = Math.min(GameModel.characterPos.x, -halfWidth);
        pos = Math.max(pos, -27 + halfWidth);
        let step = (pos - this.posSmooth) / 30;
        if (Math.abs(step) < 0.001) step = 0;
        this.posSmooth += step;
        return this.posSmooth;
    }

    setOutsidePos() {
        let halfWidth = this.renderer.ratio * GameModel.sceneHeight / 2;
        this.posSmooth = -halfWidth;
    }

    getScreenPos(pos: Vector3) {
        return pos.transform(this.camera.viewProjection);

    }
}

import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import GLFTLoader from "./GLFTLoader";
import Ray from "./lib/Ray";
import GameModel, {Scenes} from "../public/GameModel";
import {Vector3} from "math.gl";

export default class Scene {
    public renderer: Renderer;
    public glFTLoader: GLFTLoader;

    constructor(renderer: Renderer, preloader: PreLoader, glft: string) {
        this.renderer = renderer;
        this.glFTLoader = new GLFTLoader(this.renderer, glft, preloader);
    }

    checkMouseHit(mouseRay: Ray) {
        let label = ""
        let hit = false;
//TODO check closest hit

        for (let m of this.glFTLoader.modelsHit) {

            if (!m.needsHitTest) continue;
            if (GameModel.currentScene == Scenes.ROOM) {
                if (GameModel.roomCamOffset > 0) {
                    if (m.getWorldPos(Vector3.ZERO).x < -0.1) {
                        continue
                    }
                } else {
                    if (m.getWorldPos(Vector3.ZERO).x > 0.1) {
                        continue
                    }
                }
            }

            if (m.checkHit(mouseRay)) {


                label = m.label
                hit = true;
                GameModel.hitWorldPos = m.getWorldPos(m.hitTestObject.localPos)
                GameModel.hitWorldNormal = m.hitTestObject.localNormal;//.transform( m.worldMatrix) //transform by normal matrix?
            } else {

            }
        }
        if (label != "") {
            GameModel.hitObjectLabel = this.renderer.modelByLabel[label].hitLabel
        } else {
            GameModel.hitObjectLabel = "";
        }
        return hit;
    }

    onUI() {
        this.glFTLoader.root.onUI();
    }

}

import GameModel, {Scenes} from "../../public/GameModel";

export default class Trigger {
    private scene: Scenes;


    constructor(scene: Scenes) {
        this.scene = scene;

    }

    init() {
    }

    check() {

        if (GameModel.currentScene != this.scene) return false;

        return true;
    }
}

import GameModel, {Scenes} from "../GameModel";

export default class Trigger{
    private scene: Scenes;



    constructor(scene:Scenes) {
        this.scene = scene;

    }
    check(){

        if(GameModel.currentScene !=this.scene) return false;

        return true;
    }
}

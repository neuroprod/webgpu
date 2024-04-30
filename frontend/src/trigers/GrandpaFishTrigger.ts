import Trigger from "./Trigger";
import GameModel, {Scenes, StateGrandpa} from "../../public/GameModel";

export default class GrandpaFishTrigger extends Trigger {
    constructor(scene: Scenes) {
        super(scene)


    }

    check(): boolean {

        if (super.check() && GameModel.stateGrandpa == StateGrandpa.FEED_FISH) {

            let halfWidth = GameModel.renderer.ratio * GameModel.sceneHeight / 2;
            let left = GameModel.characterPos.x - halfWidth - 2;
            let right = GameModel.characterPos.x + halfWidth + 2;
            let pos = GameModel.renderer.modelByLabel["grandpaPants"].getPosition().x
            if (pos < left || pos > right) {
                GameModel.stateGrandpa = StateGrandpa.SHOW_GRANDPA_PANTS;
            }
        }
        return false
    }
}

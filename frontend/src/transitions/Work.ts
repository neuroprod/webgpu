import Transition from "./Transition";
import GameModel, {StateFasion, StateGirl, StateHighTech} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";
import {PantsState} from "../extras/Pants3D";

export default class Work extends Transition {

    public state = 0;
    public count = 0;

    set(onComplete: () => void) {
        super.set(onComplete)
        this.state = 0;


        this.count = 0;
        GameModel.characterHandler.startTyping()
        setTimeout(() => {
            GameModel.sound.startTyping()
        }, 300)

        if (GameModel.stateFashion == StateFasion.CAN_MAKE_TRIANGLE) {
            GameModel.pants3D.setState(PantsState.StartPants)

            GameModel.textHandler.showHitTrigger("makeTriangle", true)
            GameModel.stateFashion = StateFasion.MAKE_TRIANGLE
            GameModel.gameUI.cursor.show(CURSOR.NEXT)
            GameModel.stateHighTech = StateHighTech.GROW_FLOWER;
            GameModel.stateGirl = StateGirl.BIRD_HOUSE_FELL;

        }
    }

    onMouseDown() {

        if (this.state == 1) return;
        GameModel.gameUI.cursor.animate()
        if (this.state == 0) {
            this.count++;
            if (GameModel.stateFashion == StateFasion.MAKE_TRIANGLE) {
                if (this.count == 1) GameModel.pants3D.setState(PantsState.AddTriangles)
                if (this.count == 2) GameModel.pants3D.setState(PantsState.MakeShape)
                if (this.count == 3) GameModel.pants3D.setState(PantsState.Textures)
                if (this.count == 4) GameModel.pants3D.setState(PantsState.Shading)
                if (this.count == 5) GameModel.pants3D.setState(PantsState.Post)
            } else {
                //   if (this.count == 1) GameModel.pants3D.setState(PantsState.StartPantsEnd)

            }
        }

        if (this.state == 0 && GameModel.textHandler.readNext()) {

            this.state = 1;
            GameModel.gameUI.cursor.hide()
            let obj = GameModel.renderer.modelByLabel["labtop"]
            let world = obj.getWorldPos()
            world.z += 1.1;
            world.x += 0.5;

            GameModel.pants3D.setState(PantsState.EndPants)
            GameModel.sound.stopTyping()
            GameModel.characterHandler.walkTo(world, 0, this.onEndWalkDone.bind(this))
            if (GameModel.stateFashion == StateFasion.MAKE_TRIANGLE) {
                GameModel.stateFashion = StateFasion.FINISH_WEBSITE_DONE
            }


        }

        if (this.state == 2 && GameModel.textHandler.readNext()) {
            GameModel.gameUI.cursor.hide()
            GameModel.clock.addTime()
            GameModel.clock.addTime()
            GameModel.clock.addTime()
            GameModel.clock.addTime()

            this.onComplete()
        }

    }

    onEndWalkDone() {
        this.state = 2;
        GameModel.gameUI.cursor.show(CURSOR.NEXT)

        if (GameModel.stateFashion == StateFasion.FINISH_WEBSITE_DONE) {
            GameModel.textHandler.showHitTrigger("makeWebsiteDone")
        }

    }
}

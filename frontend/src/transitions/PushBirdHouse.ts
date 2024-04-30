import Transition from "./Transition";
import GameModel, {StateGirl} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";
import gsap from "gsap"

export default class PushBirdHouse extends Transition {
    public angle = 0.6;
    public angleBottom = 0;
    private isText: boolean = false;

    set(onComplete: () => void) {
        super.set(onComplete)
        GameModel.textHandler.showHitTrigger("pushBirdHouse")
        this.isText = true;
        GameModel.gameUI.cursor.show(CURSOR.NEXT)


    }

    onCompleteAnimation() {


        GameModel.renderer.modelByLabel["girlPants"].visible = true;
        GameModel.renderer.modelByLabel["girlPants"].enableHitTest = true;
        GameModel.stateGirl = StateGirl.PUSH_BIRDHOUSE
        GameModel.sound.playKnock();


        setTimeout(() => {
            GameModel.characterHandler.setAnimationOnce("birdHouse2", 0.1, () => {
            })
        }, 1000);


        GameModel.animationMixer.setExtraAnime("pantsFall", this.onCompleteFall.bind(this))

    }

    onCompleteFall() {

        GameModel.renderer.modelByLabel["stickHold"].visible = false
        GameModel.characterHandler.setIdleAndTurn()
        this.onComplete()
    }

    onMouseDown() {
        if (!this.isText) {
            return;
        }
        GameModel.gameUI.cursor.animate()
        if (GameModel.textHandler.readNext()) {

            GameModel.renderer.modelByLabel["stickHold"].visible = true
            GameModel.characterHandler.setAnimationOnce("birdhouse", 0.3, this.onCompleteAnimation.bind(this))
            setTimeout(() => {
                let birhouse = GameModel.renderer.modelByLabel["birdHouse"]
                let birdHouseBottom = GameModel.renderer.modelByLabel["birdHouseBottom"]
                gsap.to(this, {
                    angle: 0.3, duration: 0.3, ease: "back.out", onUpdate: () => {
                        birhouse.setEuler(0, 0, this.angle)
                    }
                })
                gsap.to(this, {
                    angleBottom: 3.14 / 2, duration: 1.5, ease: "elastic.out", onUpdate: () => {
                        birdHouseBottom.setEuler(0, 0, -this.angleBottom)
                    }
                })

            }, 45 * (1000 / 30));
            GameModel.gameUI.cursor.hide()
            this.isText = false;
        }
    }
}

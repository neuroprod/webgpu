import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import gsap from "gsap";
import GameModel, {Transitions} from "../../public/GameModel";


export default class EnterButton extends UIBitmapModel {

    private scale = 1
    private kill: boolean = false;

    constructor(renderer: Renderer, preLoader: PreLoader) {
        super(renderer, preLoader, "UI/enter.png", "UI/enter.png");
    }

    update() {
        if (!this.visible) return;
        super.update();
        this.setScale(this.scale, this.scale, this.scale)

        this.setPosition(GameModel.screenWidth - 300, GameModel.screenHeight - 200, 0)


    }

    onClick() {
        super.onClick();
        this.mouseEnabled = false;
        GameModel.setTransition(Transitions.START_GAME)
        this.kill = true;
        gsap.to(this, {
            scale: 0, duration: 0.15, ease: "back.out", onComplete: () => {
                this.visible = false
            }
        })
    }

    onOver() {
        if (this.kill) return
        super.onOver();

        gsap.killTweensOf(this)
        gsap.to(this, {scale: 1.1, duration: 0.15, ease: "back.out"})

    }

    onOut() {
        if (this.kill) return
        super.onOut();
        gsap.killTweensOf(this)
        gsap.to(this, {scale: 1, duration: 0.1, ease: "back.out"})
    }


}

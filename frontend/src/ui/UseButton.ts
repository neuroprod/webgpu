import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel from "../../public/GameModel";
import gsap from "gsap";

export default class UseButton extends UIBitmapModel {

    private scale = 1

    constructor(renderer: Renderer, preLoader: PreLoader,) {
        super(renderer, preLoader, "useBtn", "UI/useBtn.png");
    }

    update() {
        super.update();
        this.setScale(this.scale, this.scale, this.scale)
    }

    onOver() {
        if (!this.visible) return;
        super.onOver();
        GameModel.sound.playClick(0.4);
        gsap.killTweensOf(this)
        gsap.to(this, {scale: 1.05, duration: 0.15, ease: "back.out"})

    }

    onOut() {

        super.onOut();
        gsap.killTweensOf(this)
        gsap.to(this, {scale: 1, duration: 0.1, ease: "back.out"})
    }


}

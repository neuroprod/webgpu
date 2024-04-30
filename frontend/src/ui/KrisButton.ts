import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import gsap from "gsap";
import GameModel from "../../public/GameModel";


export default class KrisButton extends UIBitmapModel {

    private scale = 1

    constructor(renderer: Renderer, preLoader: PreLoader, label: string) {
        super(renderer, preLoader, label, "UI/kris.webp");
    }

    update() {
        if (!this.visible) return;
        super.update();
        this.setScale(this.scale, this.scale, this.scale)
    }

    onOver() {

        super.onOver();
        GameModel.sound.playClick(0.2);
        gsap.killTweensOf(this)
        gsap.to(this, {scale: 1.1, duration: 0.15, ease: "back.out"})

    }

    onOut() {

        super.onOut();
        gsap.killTweensOf(this)
        gsap.to(this, {scale: 1, duration: 0.1, ease: "back.out"})
    }


}

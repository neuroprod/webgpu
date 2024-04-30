import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel from "../../public/GameModel";
import gsap from "gsap";
import UIData from "../UIData";

export default class CheckButton extends UIBitmapModel {

    private scale = 1
    private checkAlpha = 0;
    private selected = false;

    constructor(renderer: Renderer, preLoader: PreLoader, label: string) {
        super(renderer, preLoader, label, "UI/check.webp");

    }

    update() {
        if (!this.visible) return;
        super.update();
        this.setScale(this.scale, this.scale, this.scale)
        this.material.uniforms.setUniform("alpha", this.checkAlpha)
    }

    onClick() {
        super.onClick();
        GameModel.sound.playClick(0.5);
        gsap.killTweensOf(this)
        this.scale = 1;
        gsap.to(this, {scale: 1.1, duration: 0.15, ease: "back.out"})
        this.selected = !this.selected;
        if (this.selected) {
            this.checkAlpha = 1;

        } else {
            this.checkAlpha = 0;
        }
        GameModel.debug = this.selected;
        UIData.debug = this.selected;
    }

    onOver() {

        super.onOver();
        GameModel.sound.playClick(0.2);
        if (this.selected) {
            gsap.killTweensOf(this)

            gsap.to(this, {scale: 1.1, duration: 0.15, ease: "back.out"})

        } else {
            this.checkAlpha = 0.8;

            gsap.killTweensOf(this)
            gsap.to(this, {scale: 1, duration: 0.15, ease: "back.out"})
        }


    }

    onOut() {

        super.onOut();
        gsap.killTweensOf(this)
        gsap.to(this, {scale: 1, duration: 0.1, ease: "back.out"})
        if (!this.selected) this.checkAlpha = 0.0;
    }


    select(b: boolean) {
        this.selected = b;
        if (this.selected) {
            this.checkAlpha = 1;

        } else {
            this.checkAlpha = 0;
        }
    }
}

import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import gsap from "gsap";

export default class CursorIcon extends UIBitmapModel {

    cursorScale = 0;
    cursorAngle = 0;

    constructor(renderer: Renderer, preLoader: PreLoader, label: string, url: string) {
        super(renderer, preLoader, label, url);
        this.mouseEnabled = false
    }

    update() {
        if (!this.visible) return;
        super.update()
        this.setScale(this.cursorScale, this.cursorScale, this.cursorScale)
        this.setEuler(0, 0, this.cursorAngle)
    }

    public show() {
        this.visible = true
        gsap.killTweensOf(this);
        this.cursorScale = 0.5
        this.cursorAngle = 0
        gsap.to(this, {cursorScale: 0.7, duration: 0.2, ease: "back.out"})
    }

    public hide() {
        gsap.killTweensOf(this);
        gsap.to(this, {
            cursorScale: 0.3, duration: 0.02, onComplete: () => {
                this.visible = false
            }
        })
    }

    animate() {
        this.cursorScale = 0.5
        gsap.to(this, {cursorScale: 0.7, duration: 0.2, ease: "back.out"})

    }
}

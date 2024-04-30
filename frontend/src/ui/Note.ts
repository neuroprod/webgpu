import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import UIBitmapModel from "../lib/model/UIBitmapModel";
import GameModel from "../../public/GameModel";
import gsap from "gsap";

export default class Note extends UIBitmapModel {
    private uiScale: number = 1;
    private yPos = -100;
    private isOpen: boolean = false;

    constructor(renderer: Renderer, preLoader: PreLoader) {
        super(renderer, preLoader, "inventory", "UI/note.webp");
        this.visible = false;
    }

    update() {
        if (!this.visible) return;
        super.update();
        this.setPosition(GameModel.screenWidth / 2, GameModel.screenHeight / 2 + this.yPos, 0)
        if (GameModel.screenHeight > 1000) {
            this.uiScale = 1;
        } else {
            this.uiScale = GameModel.screenHeight / 1000;
        }
        this.setScale(this.uiScale, this.uiScale, this.uiScale)

    }

    hide() {
        this.isOpen = false;
        gsap.killTweensOf(this);
        gsap.to(this, {
            yPos: 100, duration: 0.3, ease: "back.out", onComplete: () => {
                this.visible = false
            }
        })
    }

    show() {
        gsap.killTweensOf(this);
        this.visible = true;
        this.isOpen = false;
        gsap.to(this, {yPos: 0, duration: 0.6, ease: "back.out"})
    }
}

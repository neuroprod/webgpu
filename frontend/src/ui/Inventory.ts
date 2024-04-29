import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel from "../../public/GameModel";
import gsap from "gsap";
import InventoryButton from "./InventoryButton";


export default class Inventory extends UIBitmapModel {
    //182/878
    private h = 140;
    private yPos: number = 110 / 2;
    private btns: Array<InventoryButton> = [];
    private openBtn: UIBitmapModel;
    private isOpen = false;
    private closePos = -50;

    constructor(renderer: Renderer, preLoader: PreLoader) {
        super(renderer, preLoader, "inventory", "UI/inventory.webp");
        this.yPos = this.closePos;
        for (let i = 0; i < 7; i++) {
            let posX = -320 + i * 135;

            let btn = new InventoryButton(this.renderer, preLoader, "UI/pants_" + (i + 1) + ".png", i, posX);
            this.addChild(btn);
            this.btns.push(btn)
        }
        this.material.uniforms.setUniform("alpha", 1.0)
        this.openBtn = new UIBitmapModel(renderer, preLoader, "open", "UI/inventoryButton.png")
        this.openBtn.setPosition(-260, 75, 0)
        this.addChild(this.openBtn);
        this.openBtn.onClick = this.tryOpen.bind(this)
        this.updateInventory()
    }

    update() {
        if (!this.visible) return;
        super.update();
        this.setPosition(878 / 2, this.yPos, 0)


    }


    hide() {
        this.isOpen = false;
        gsap.killTweensOf(this);
        gsap.to(this, {yPos: -this.h, duration: 0.3, ease: "back.out"})
    }

    show() {
        gsap.killTweensOf(this);
        this.isOpen = false;
        gsap.to(this, {yPos: this.closePos, duration: 0.6, ease: "back.out"})
    }

    close() {
        if (this.isOpen) {
            gsap.to(this, {yPos: this.closePos, duration: 0.3, ease: "back.out"})
            this.isOpen = false;
        }
    }

    updateInventory() {

        for (let i = 0; i < 7; i++) {
            this.btns[i].visible = false;
        }
        let tempArray = []

        for (let a of GameModel.pantsFound) {
            tempArray.push(this.btns[a])
        }

        for (let i = 0; i < tempArray.length; i++) {
            let posX = -320 + i * 135
            tempArray[i].visible = true;
            tempArray[i].setPosition(posX, -25, 0)
        }


    }

    private tryOpen() {
        gsap.killTweensOf(this);
        GameModel.sound.playClick()
        //GameModel.sound.playWoosh(0.1)
        if (this.isOpen) {
            gsap.to(this, {yPos: this.closePos, duration: 0.3, ease: "back.out"})
        } else {
            gsap.to(this, {yPos: this.h / 2, duration: 0.3, ease: "back.out"})
        }
        this.isOpen = !this.isOpen;

    }
}


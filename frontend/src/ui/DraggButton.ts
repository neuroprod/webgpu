import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel from "../../public/GameModel";
import gsap from "gsap";
import {clamp, Vector3} from "math.gl";

export default class DraggButton extends UIBitmapModel {

    public placePos: Vector3 = new Vector3();
    minDragg: number = -180;
    maxDragg: number = 333;
    onChange: (value: number) => void;
    private scale = 1
    private isDragging: boolean;
    private targetX: number;
    private currentStep: number = -1;

    constructor(renderer: Renderer, preLoader: PreLoader, label: string) {
        super(renderer, preLoader, label, "UI/dragg.png");


    }

    update() {
        if (!this.visible) return;
        super.update();
        this.setScale(this.scale, this.scale, this.scale)
        if (this.isDragging) {
            this.targetX = (GameModel.mousePos.x - GameModel.screenWidth / 2) / this.parent.getScale().x;


            this.placePos.x = clamp(this.targetX, this.minDragg, this.maxDragg);
            let value = (this.placePos.x - this.minDragg) / (this.maxDragg - this.minDragg);
            let step = Math.round(value * 12);
            if (step != this.currentStep) {
                GameModel.sound.playClick(0.1)
                this.currentStep = step;
            }
            this.onChange(Math.pow(value * 1.5, 2));
        }

        this.setPositionV(this.placePos)
    }

    onDown() {
        super.onDown();
        this.isDragging = true;
    }

    onUp() {
        super.onUp();
        this.isDragging = false;
        this.onOut();
    }

    onOver() {

        super.onOver();
        if (this.isDragging) return
        GameModel.sound.playClick(0.2);
        gsap.killTweensOf(this)
        gsap.to(this, {scale: 1.1, duration: 0.15, ease: "back.out"})

    }

    onOut() {

        super.onOut();
        if (this.isDragging) return
        gsap.killTweensOf(this)
        gsap.to(this, {scale: 1, duration: 0.1, ease: "back.out"})
    }


}

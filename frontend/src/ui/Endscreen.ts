import UIBitmapModel from "../lib/model/UIBitmapModel";

import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel from "../GameModel";
import gsap from "gsap";

export default class Endscreen extends UIBitmapModel {
    private uiScale: number;
    public alpha=0;

    constructor(renderer: Renderer, preLoader: PreLoader) {
        super(renderer, preLoader, "endscreen", "UI/endscreen.webp");
        this.visible =false;
    }
    update() {
        if (!this.visible) return;
        super.update();
        this.setPosition(GameModel.screenWidth / 2+100, GameModel.screenHeight / 2 , -1)
        if (GameModel.screenHeight > 1000) {
            this.uiScale = 0.7;
        } else {
            this.uiScale = GameModel.screenHeight / 1000 *0.7;
        }
        this.material.uniforms.setUniform("alpha",this.alpha);
        this.setScale(this.uiScale, this.uiScale, this.uiScale)
    }
    public show(){
        this.visible =true;
        gsap.to(this,{alpha:1,duration:1,delay:1});
    }
}

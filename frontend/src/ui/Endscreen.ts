import UIBitmapModel from "../lib/model/UIBitmapModel";

import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel from "../../public/GameModel";
import gsap from "gsap";


import KrisEndButton from "./KrisEndButton";
import MusicEndButton from "./MusicEndButton";

export default class Endscreen extends UIBitmapModel {
    private uiScale: number;
    public alpha = 0;
    private musicButton: MusicEndButton;
    private krisButton: KrisEndButton;

    constructor(renderer: Renderer, preLoader: PreLoader) {
        super(renderer, preLoader, "endscreen", "UI/endscreen.webp");
        this.visible = false;

        this.mouseEnabled = true;
        this.krisButton = new KrisEndButton(renderer, preLoader, "krisMenuEnd")
        this.krisButton.setPosition(100, 50, 0);
        this.addChild(this.krisButton)
        this.krisButton.onClick = () => {

            GameModel.sound.playClick()
            window.open("http://neuroproductions.be/", "_blank");
        }

        this.musicButton = new MusicEndButton(renderer, preLoader, "musicMenu")
        this.musicButton.setPosition(-30, 300, 0);
        this.addChild(this.musicButton)
        this.musicButton.onClick = () => {

            GameModel.sound.playClick()
            window.open("https://musopen.org/music/4107-goldberg-variations-bwv-988/", "_blank");
        }


    }

    update() {
        if (!this.visible) return;
        super.update();
        this.setPosition(GameModel.screenWidth / 2 + 100, GameModel.screenHeight / 2, -1)
        if (GameModel.screenHeight > 1000) {
            this.uiScale = 1;
        } else {
            this.uiScale = GameModel.screenHeight / 1000 * 1;
        }
        this.material.uniforms.setUniform("alpha", this.alpha);
        this.musicButton.material.uniforms.setUniform("alpha", this.alpha);
        this.krisButton.material.uniforms.setUniform("alpha", this.alpha);
        this.setScale(this.uiScale, this.uiScale, this.uiScale)
    }

    public show() {
        this.visible = true;
        gsap.to(this, {alpha: 1, duration: 1, delay: 1});
    }
}

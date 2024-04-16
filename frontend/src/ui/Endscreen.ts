import UIBitmapModel from "../lib/model/UIBitmapModel";
import CloseButton from "./CloseButton";
import DraggButton from "./DraggButton";
import CheckButton from "./CheckButton";
import KrisButton from "./KrisButton";
import GithubButton from "./GithubButton";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel from "../GameModel";

export default class Endscreen extends UIBitmapModel {
    private uiScale: number;


    constructor(renderer: Renderer, preLoader: PreLoader) {
        super(renderer, preLoader, "endscreen", "UI/endscreen.webp");
        this.visible =false;
    }
    update() {
        if (!this.visible) return;
        super.update();
        this.setPosition(GameModel.screenWidth / 2, GameModel.screenHeight / 2 , -1)
        if (GameModel.screenHeight > 1000) {
            this.uiScale = 1;
        } else {
            this.uiScale = GameModel.screenHeight / 1000;
        }

        this.setScale(this.uiScale, this.uiScale, this.uiScale)
    }

}

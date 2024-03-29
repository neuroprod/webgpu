import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel, {UIState} from "../GameModel";
import gsap from "gsap";
import CloseButton from "./CloseButton";
import DraggButton from "./DraggButton";
import CheckButton from "./CheckButton";

export default class Menu extends UIBitmapModel {
    private yPos: number = 133 / 2 - 20;
    private closeButton: CloseButton;
    private yOff: number = 0;
    private uiScale: number = 1;
    private draggMusicButton: DraggButton;
    private draggFxButton: DraggButton;
     checkBtn: CheckButton;

    constructor(renderer: Renderer, preLoader: PreLoader) {
        super(renderer, preLoader, "menu", "UI/mainMenu.webp");
        this.visible = false;

        this.closeButton = new CloseButton(renderer, preLoader, "closeMenu")
        this.closeButton.setPosition(450, -360, 0);
        this.addChild(this.closeButton)
        this.closeButton.onClick = () => {
            GameModel.setUIState(UIState.GAME_DEFAULT);
            GameModel.sound.playClick()
        }

        this.draggMusicButton = new DraggButton(renderer, preLoader, "dragMusic");
        this.draggMusicButton.placePos.set(162, -132, 0);
        this.draggMusicButton.onChange = (value: number) => {
            GameModel.sound.setMusicVolume(value)
        }
        this.addChild(this.draggMusicButton)


        this.draggFxButton = new DraggButton(renderer, preLoader, "dragFx");
        this.draggFxButton.placePos.set(162, -40, 0);
        this.draggFxButton.onChange = (value: number) => {
            GameModel.sound.setFXVolume(value)
        }
        this.addChild(this.draggFxButton)

        this.checkBtn = new CheckButton(renderer, preLoader, "checkBtn");
        this.checkBtn.setPosition(-150, 33, 0);
        this.addChild(this.checkBtn)


    }

    update() {
        if (!this.visible) return;
        super.update();
        this.setPosition(GameModel.screenWidth / 2, GameModel.screenHeight / 2 + this.yOff, 0)
        if (GameModel.screenHeight > 1000) {
            this.uiScale = 1;
        } else {
            this.uiScale = GameModel.screenHeight / 1000;
        }
        this.setScale(this.uiScale, this.uiScale, this.uiScale)
    }

    hide() {

        gsap.killTweensOf(this);

        gsap.to(this, {
            yOff: -50, duration: 0.1, ease: "power2.in", onComplete: () => {
                this.visible = false;
            }
        })
    }

    show() {
        GameModel.sound.playWoosh()
        gsap.killTweensOf(this);
        this.yOff = -50;
        gsap.to(this, {yOff: 0, duration: 0.3, ease: "back.out"})
        this.visible = true;
    }
}


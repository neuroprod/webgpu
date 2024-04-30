import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel, {UIState} from "../../public/GameModel";
import gsap from "gsap";
import CloseButton from "./CloseButton";
import DraggButton from "./DraggButton";
import CheckButton from "./CheckButton";
import KrisButton from "./KrisButton";
import GithubButton from "./GithubButton";

export default class Menu extends UIBitmapModel {
    private yPos: number = 133 / 2 - 20;
    private closeButton: CloseButton;
    private yOff: number = 0;
    private uiScale: number = 1;
    private draggMusicButton: DraggButton;
    private draggFxButton: DraggButton;
    checkBtn: CheckButton;
    private krisButton: KrisButton;
    private githubButton: GithubButton;

    constructor(renderer: Renderer, preLoader: PreLoader) {
        super(renderer, preLoader, "menu", "UI/mainMenu.webp");
        this.visible = false;

        this.closeButton = new CloseButton(renderer, preLoader, "closeMenu")
        this.closeButton.setPosition(430, -360, 0);
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
        this.checkBtn.setPosition(-159, 33 + 5, 0);
        this.addChild(this.checkBtn)


        this.krisButton = new KrisButton(renderer, preLoader, "krisMenu")
        this.krisButton.setPosition(-20, 340, 0);
        this.addChild(this.krisButton)
        this.krisButton.onClick = () => {

            GameModel.sound.playClick()
            window.open("http://neuroproductions.be/", "_blank");
        }

        this.githubButton = new GithubButton(renderer, preLoader, "gitMenu")
        this.githubButton.setPosition(30, 258, 0);
        this.githubButton.setScale(0.9, 0.9, 0.9);
        this.addChild(this.githubButton)
        this.githubButton.onClick = () => {

            GameModel.sound.playClick()
            window.open("https://github.com/neuroprod/webgpu", "_blank");
        }


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


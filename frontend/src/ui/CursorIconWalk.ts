import CursorIcon from "./CursorIcon";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";

import UIBitmapModel from "../lib/model/UIBitmapModel";
import GameModel from "../../public/GameModel";
import gsap from "gsap";

export default class CursorIconWalk extends CursorIcon {
    private walkLeft: UIBitmapModel;
    private walkRight: UIBitmapModel;

    constructor(renderer: Renderer, preLoader: PreLoader, label: string, url: string) {
        super(renderer, preLoader, label, url);
        this.material.uniforms.setUniform("alpha", 0)
        this.walkLeft = new UIBitmapModel(renderer, preLoader, "walkLeft", "UI/walk.png")
        this.addChild(this.walkLeft)
        this.walkRight = new UIBitmapModel(renderer, preLoader, "walkRight", "UI/walkRight.png")

        this.addChild(this.walkRight)

        this.walkRight.mouseEnabled = false
        this.walkLeft.mouseEnabled = false

    }

    update() {
        if (!this.visible) return;
        super.update();

        if (GameModel.getCharacterScreenPos().x > GameModel.mousePos.x) {
            this.walkLeft.visible = true;
            this.walkRight.visible = false;
        } else {
            this.walkLeft.visible = false;
            this.walkRight.visible = true;
        }
        // this.setPosition(Math.sin(Timer.time*6)*10,0,0)
    }

    animate() {
        super.animate();
        this.cursorAngle = 0;
        if (this.walkLeft.visible) {
            gsap.to(this, {cursorAngle: +Math.PI * 1.999, duration: 0.8})
        } else {
            gsap.to(this, {cursorAngle: -Math.PI * 1.999, duration: 0.8})
        }

    }


}

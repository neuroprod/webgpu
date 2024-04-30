import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import GameModel, {UIState} from "../../public/GameModel";
import gsap from "gsap";

export default class InventoryButton extends UIBitmapModel {
    public id: number;
    private overlay: UIBitmapModel;
    private scale = 0.45;
    private rot = 0.5;

    constructor(renderer: Renderer, preLoader: PreLoader, url, id: number, posX: number) {
        super(renderer, preLoader, url, url);

        this.id = id;
        this.rot = (Math.random() - 0.5) * 0.4;
        this.setPosition(posX, -30, 0)

        /*  this.overlay =new UIBitmapModel(renderer,preLoader,"overLay"+id,"UI/pants_select.png")
          this.addChild(this.overlay)
          this.overlay.mouseEnabled =false;*/
    }

    update() {
        if (!this.visible) return;
        super.update();
        this.setScale(this.scale, this.scale, this.scale)
        this.setEuler(0.0, 0.0, this.rot)
    }

    onOver() {

        super.onOver();
        gsap.killTweensOf(this);
        gsap.to(this, {scale: 0.55, duration: 0.2, ease: "back.out"})
        // gsap.to(this,{rot:(Math.random()-0.5)*0.6,duration:0.2,ease:"power2.out"})
        GameModel.sound.playClick(0.2)

    }

    onOut() {

        super.onOut();

        gsap.killTweensOf(this);
        gsap.to(this, {scale: 0.45, duration: 0.1, ease: "back.in"})
        // gsap.to(this,{rot:(Math.random()-0.5)*0.4,duration:0.1,ease:"power2.in"})
    }

    onClick() {
        super.onClick();
        GameModel.sound.playClick()
        GameModel.sound.playWoosh()

        GameModel.setUIState(UIState.INVENTORY_DETAIL, this.id, true);
    }


}

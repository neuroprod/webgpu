import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import CursorIcon from "./CursorIcon";
import Timer from "../lib/Timer";

export default class CursorIconArrow extends CursorIcon {
    constructor(renderer: Renderer, preLoader: PreLoader, label: string, url: string) {
        super(renderer, preLoader, label, url);
    }

    update() {
        if (!this.visible) return;
        super.update();

        this.setPosition(Math.sin(Timer.time * 6) * 10, 0, 0)
    }
}

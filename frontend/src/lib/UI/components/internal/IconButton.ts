import Component from "../Component";
import Vec2 from "../../math/Vec2";

import UI_I from "../../UI_I";
import {ButtonBaseSettings} from "./ButtonBase";

export class IconButtonSettings extends ButtonBaseSettings {
    constructor() {
        super();
        this.box.size.set(20, 20);
    }
}

export default class IconButton extends Component {
    private iconPos: Vec2 = new Vec2();
    private icon: number;

    constructor(id: number, icon: number, settings: ButtonBaseSettings) {
        super(id, settings);

        this.size.copy(settings.box.size);

        this.icon = icon;
    }

    layoutAbsolute() {
        super.layoutAbsolute();
        this.iconPos.copy(this.layoutRect.pos);
        this.iconPos.x += 2;
        this.iconPos.y += 2;
    }

    prepDraw() {
        if (this.layoutRect.size.x < 0) return;
        super.prepDraw();

        let settings = this.settings as ButtonBaseSettings;
        UI_I.currentDrawBatch.textBatch.addIcon(
            this.iconPos,
            this.icon,
            settings.labelColor
        );

        if (settings.transparent) return;
        let color;
        if (this.isDown) {
            color = settings.downColor;
        } else if (this.isOver) {
            color = settings.overColor;
        } else {
            color = settings.backColor;
        }

        UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, color);
    }

    getReturnValue() {
        return this.isClicked;
    }
}

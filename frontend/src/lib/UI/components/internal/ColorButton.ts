import Color from "../../math/Color";
import UI_I from "../../UI_I";

import Component, {ComponentSettings} from "../Component";
import Rect from "../../math/Rect";

export class ColorButtonSettings extends ComponentSettings {
    constructor() {
        super();
    }
}

export default class ColorButton extends Component {
    public colorNoAlpha: Color = new Color();
    private color: Color;
    private alphaRect = new Rect();

    constructor(id: number, color: Color, settings: ColorButtonSettings) {
        super(id, settings);

        this.size.copy(settings.box.size);
        this.color = color;
    }

    layoutAbsolute() {
        super.layoutAbsolute();

        this.alphaRect.copy(this.layoutRect);
        this.alphaRect.size.x /= 2;
        this.alphaRect.pos.x += this.alphaRect.size.x;
    }

    prepDraw() {
        if (this.layoutRect.size.x < 0) return;
        super.prepDraw();

        if (this.color.a != 1) {
            this.colorNoAlpha.copy(this.color);
            this.colorNoAlpha.a = 1.0;
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.layoutRect,
                this.colorNoAlpha
            );
            UI_I.currentDrawBatch.fillBatch.makeAlphaGrid(this.alphaRect);
            UI_I.currentDrawBatch.fillBatch.addRect(this.alphaRect, this.color);
        } else {
            UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, this.color);
        }
    }

    getReturnValue() {
        return this.isClicked;
    }
}

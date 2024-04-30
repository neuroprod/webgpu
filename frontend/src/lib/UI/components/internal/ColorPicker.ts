import Component, {ComponentSettings} from "../Component";
import Rect from "../../math/Rect";
import Vec2 from "../../math/Vec2";
import Color from "../../math/Color";
import UI_I from "../../UI_I";
import Utils from "../../math/Utils";
import Font from "../../draw/Font";

export class ColorPickerSettings extends ComponentSettings {
    constructor() {
        super();

        this.box.size.set(310, 256);
    }
}

export default class ColorPicker extends Component {
    private pickRect: Rect = new Rect();
    private picCirclePos: Vec2 = new Vec2();

    private heuRect: Rect = new Rect();

    private alphaRect: Rect = new Rect();
    private vBarWidth: number = 20;
    private vBarSpacing: number = 7;

    private hsl: Array<number>;
    private color: Color;
    private colorHue: Color = new Color();
    private colorStart = new Color();

    private huePosLeft: Vec2 = new Vec2();
    private huePosRight: Vec2 = new Vec2();
    private alphaPosLeft: Vec2 = new Vec2();
    private alphaPosRight: Vec2 = new Vec2();
    private dragType!: number;
    private changed: boolean = false;

    constructor(id: number, color: Color, settings: ColorPickerSettings) {
        super(id, settings);

        this.color = color;
        this.colorStart.copy(this.color);
        this.size.copy(settings.box.size);

        this.hsl = this.color.getHSVArray();
        this.colorHue.setHSV(this.hsl[0], 1, 1);

        this.pickRect.setSize(256, 256);
        this.heuRect.setSize(20, 256);
        this.alphaRect.setSize(20, 256);
    }

    updateColor() {
        this.colorHue.setHSV(this.hsl[0], 1, 1);

        this.color.setHSV(this.hsl[0], this.hsl[1], this.hsl[2]);
        this.colorStart.copy(this.color);

        this.changed = true;

        this.setDirty();
    }

    updateAlpha() {
        this.colorStart.copy(this.color);

        this.changed = true;
        this.setDirty();
    }

    getReturnValue(): boolean {
        let change = this.changed;
        this.changed = false;
        return change;
    }

    updateMouse() {
    }

    onMouseDown() {
        super.onMouseDown();
        if (this.pickRect.contains(UI_I.mouseListener.mousePos)) {
            this.dragType = 1;
            let pickPos = UI_I.mouseListener.mousePos.clone().sub(this.pickRect.pos);
            pickPos.scale(1 / 256);
            this.hsl[1] = pickPos.x;
            this.hsl[2] = 1 - pickPos.y;
            this.updateColor();
        } else if (this.heuRect.contains(UI_I.mouseListener.mousePos)) {
            this.dragType = 2;
            let heuPos = (UI_I.mouseListener.mousePos.y - this.heuRect.pos.y) / 256;
            this.hsl[0] = heuPos;
            this.updateColor();
        } else if (this.alphaRect.contains(UI_I.mouseListener.mousePos)) {
            this.dragType = 3;
            let alphaPos =
                1 - (UI_I.mouseListener.mousePos.y - this.alphaRect.pos.y) / 256;
            this.color.a = alphaPos;

            this.updateAlpha();
        } else {
            this.dragType = 0;
        }
    }

    onMouseUp() {
        super.onMouseUp();
        this.dragType = 0;
    }

    updateOnMouseDown() {
        if (this.dragType == 0) return;
        if (this.dragType == 1) {
            let pickPos = UI_I.mouseListener.mousePos.clone().sub(this.pickRect.pos);

            pickPos.scale(1 / 256);

            pickPos.clamp(new Vec2(), new Vec2(1, 1));
            this.hsl[1] = pickPos.x;
            this.hsl[2] = 1 - pickPos.y;
            this.updateColor();
        } else if (this.dragType == 2) {
            let heuPos = (UI_I.mouseListener.mousePos.y - this.heuRect.pos.y) / 256;
            this.hsl[0] = Utils.clamp(0, 1, heuPos);
            this.updateColor();
        } else if (this.dragType == 3) {
            let alphaPos =
                1 - (UI_I.mouseListener.mousePos.y - this.alphaRect.pos.y) / 256;
            this.color.a = Utils.clamp(0, 1, alphaPos);
            this.updateAlpha();
        }
    }

    layoutAbsolute() {
        super.layoutAbsolute();

        if (!this.color.equal(this.colorStart)) {
            this.hsl = this.color.getHSVArray();
            this.updateColor();
        }

        this.pickRect.pos.copy(this.layoutRect.pos);
        this.pickRect.setMinMax();

        this.heuRect.pos.copy(this.layoutRect.pos);
        this.heuRect.pos.x += 256 + this.vBarSpacing;
        this.heuRect.setMinMax();

        this.alphaRect.pos.copy(this.heuRect.pos);
        this.alphaRect.pos.x += this.vBarWidth + this.vBarSpacing;
        this.alphaRect.setMinMax();

        this.picCirclePos.copy(this.pickRect.pos);
        this.picCirclePos.sub(Font.iconSize.clone().scale(0.5));
        this.picCirclePos.x += 256 * this.hsl[1];
        this.picCirclePos.y += 256 * (1 - this.hsl[2]);

        this.setVerticalIndication(
            this.huePosLeft,
            this.huePosRight,
            this.heuRect,
            this.hsl[0]
        );
        this.setVerticalIndication(
            this.alphaPosLeft,
            this.alphaPosRight,
            this.alphaRect,
            1 - this.color.a
        );
    }

    prepDraw() {
        super.prepDraw();

        UI_I.currentDrawBatch.fillBatch.addRectHGradient(
            this.pickRect,
            Color.white,
            this.colorHue
        );
        UI_I.currentDrawBatch.fillBatch.addRectVGradient(
            this.pickRect,
            Color.zero,
            Color.black
        );

        UI_I.currentDrawBatch.fillBatch.makeHueRect(this.heuRect);

        UI_I.currentDrawBatch.fillBatch.makeAlphaGrid(this.alphaRect);
        let aTColor = this.color.clone();
        aTColor.a = 1;
        let aBColor = this.color.clone();
        aBColor.a = 0;
        UI_I.currentDrawBatch.fillBatch.addRectVGradient(
            this.alphaRect,
            aTColor,
            aBColor
        );

        if (this.hsl[2] < 0.5 || this.hsl[1] > 0.5) {
            UI_I.currentDrawBatch.textBatch.addIcon(
                this.picCirclePos,
                5,
                Color.white
            );
        } else {
            UI_I.currentDrawBatch.textBatch.addIcon(
                this.picCirclePos,
                5,
                Color.black
            );
        }

        UI_I.currentDrawBatch.textBatch.addIcon(this.huePosLeft, 3, Color.white);
        UI_I.currentDrawBatch.textBatch.addIcon(this.huePosRight, 4, Color.white);

        UI_I.currentDrawBatch.textBatch.addIcon(this.alphaPosLeft, 3, Color.white);
        UI_I.currentDrawBatch.textBatch.addIcon(this.alphaPosRight, 4, Color.white);
    }

    private setVerticalIndication(
        posLeft: Vec2,
        posRight: Vec2,
        fitRect: Rect,
        value: number
    ) {
        posLeft.copy(fitRect.pos);
        posRight.copy(fitRect.pos);
        posRight.x += fitRect.size.x;

        posRight.x -= Font.iconSize.x / 2 + 2;
        posLeft.x -= Font.iconSize.x / 2 - 2;
        posRight.y += value * fitRect.size.y - Font.iconSize.y / 2;
        posLeft.y = posRight.y;
    }
}

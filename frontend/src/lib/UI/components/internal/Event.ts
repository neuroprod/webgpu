import Component, {ComponentSettings} from "../Component";

import Color from "../../math/Color";
import Utils from "../../math/Utils";
import Font from "../../draw/Font";
import UI_I from "../../UI_I";
import Vec2 from "../../math/Vec2";
import Rect from "../../math/Rect";

export class EventSettings extends ComponentSettings {
    public textColor: Color = new Color().setHex("#efefef", 1);
    public labelColor: Color = new Color().setHex("#d5d5d5", 1);
    public bgColor: Color = new Color().setHex("#696a62", 0.8);
    public bgColorRight: Color = new Color().setHex("#232323", 0.8);
    public bgErrorColor: Color = new Color().setHex("#ff436d", 1);

    constructor() {
        super();
        this.box.size.y = 30;
        this.box.size.x = -1;
        this.box.marginTop = 3;
        this.box.marginBottom = 3;
    }
}

export default class Event extends Component {
    timeOutId: ReturnType<typeof setTimeout>;
    private text: string;
    private label: string;
    private showCount = 0;
    private showTime = 1000;

    private textPos: Vec2 = new Vec2();
    private maxTextWidth: number = 0;

    private labelPos: Vec2 = new Vec2();
    private maxLabelWidth: number = 0;
    private isError: boolean = false;
    private rightRect: Rect = new Rect();
    private leftRect: Rect = new Rect();

    constructor(
        id: number,
        label: string,
        text: string,
        isError: boolean,
        settings: EventSettings
    ) {
        super(id, settings);
        this.isError = isError;
        this.keepAlive = true;
        this.text = text;
        this.label = label;
        this.timeOutId = setTimeout(() => {
            this.removeThis();
        }, this.showTime);
        this.alwaysPassMouse = true;
    }

    updateText(text: string) {
        this.showCount++;
        this.text = text;
        this.setDirty();
        clearTimeout(this.timeOutId);
        this.timeOutId = setTimeout(() => {
            this.removeThis();
        }, this.showTime);
    }

    layoutAbsolute() {
        super.layoutAbsolute();
        let settings = this.settings as EventSettings;

        this.labelPos.copy(this.layoutRect.pos);
        this.labelPos.x += 10;
        this.labelPos.y += Math.floor(
            Utils.getCenterPlace(Font.charSize.y, this.layoutRect.size.y)
        );
        this.maxLabelWidth = 80;

        this.textPos.copy(this.layoutRect.pos);
        this.textPos.x += 120;
        this.textPos.y += Math.floor(
            Utils.getCenterPlace(Font.charSize.y, this.layoutRect.size.y)
        );
        this.maxTextWidth = this.layoutRect.size.x - 130;

        this.rightRect.copy(this.layoutRect);
        this.leftRect.copy(this.layoutRect);
        this.leftRect.size.x = 100;
        this.rightRect.size.x = this.layoutRect.size.x - 100;
        this.rightRect.pos.x += 100;
    }

    prepDraw() {
        super.prepDraw();
        let settings = this.settings as EventSettings;
        if (this.isError) {
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.rightRect,
                settings.bgErrorColor
            );
        } else {
            UI_I.currentDrawBatch.fillBatch.addRect(this.rightRect, settings.bgColor);
        }
        UI_I.currentDrawBatch.fillBatch.addRect(
            this.leftRect,
            settings.bgColorRight
        );
        UI_I.currentDrawBatch.textBatch.addLine(
            this.labelPos,
            this.label,
            this.maxLabelWidth,
            settings.labelColor
        );
        UI_I.currentDrawBatch.textBatch.addLine(
            this.textPos,
            this.text,
            this.maxTextWidth,
            settings.textColor
        );
    }

    private removeThis() {
        this.keepAlive = false;
    }
}

import Component, {ComponentSettings} from "../Component";
import Color from "../../math/Color";
import UI_I from "../../UI_I";
import Utils from "../../math/Utils";
import Vec2 from "../../math/Vec2";
import Font from "../../draw/Font";

export class ButtonBaseSettings extends ComponentSettings {
    constructor() {
        super();
    }

    public backColor: Color = new Color().setHex("#65625e", 1);
    public overColor: Color = new Color().setHex("#868480", 1);
    public downColor: Color = new Color().setHex("#8b826d", 1);
    public disableColor: Color = new Color().setHex("#575757", 1);
    public labelColor: Color = new Color().setHex("#ffffff", 1);
    public transparent: boolean = false;
}

export default class ButtonBase extends Component {
    private label: string;
    private textPos!: Vec2;
    private textMaxSize!: number;
    public enabled = true;

    constructor(id: number, label: string, settings: ButtonBaseSettings) {
        super(id, settings);

        this.size.copy(settings.box.size);
        this.label = label;
    }

    layoutAbsolute() {
        super.layoutAbsolute();

        this.textPos = this.layoutRect.pos.clone();
        this.textPos.copy(this.layoutRect.pos);
        this.textPos.x += 5;
        this.textPos.y += Utils.getCenterPlace(
            Font.charSize.y,
            this.layoutRect.size.y
        );
        this.textMaxSize = this.layoutRect.size.x - 10;
    }

    prepDraw() {
        if (this.layoutRect.size.x < 0) return;
        super.prepDraw();

        let settings = this.settings as ButtonBaseSettings;

        UI_I.currentDrawBatch.textBatch.addLine(
            this.textPos,
            this.label,
            this.textMaxSize,
            settings.labelColor
        );

        if (settings.transparent) return;

        let color;
        if (this.enabled) {
            if (this.isDown) {
                color = settings.downColor;
            } else if (this.isOver) {
                color = settings.overColor;
            } else {
                color = settings.backColor;
            }
        } else {
            color = settings.disableColor;
        }
        UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, color);
    }

    getReturnValue() {
        if (!this.enabled) return false;
        return this.isClicked;
    }
}

import ButtonBase, {ButtonBaseSettings} from "./ButtonBase";
import UI_I from "../../UI_I";
import Color from "../../math/Color";
import Vec2 from "../../math/Vec2";
import Rect from "../../math/Rect";

export class SelectButtonSettings extends ButtonBaseSettings {
    iconBoxColor: Color = new Color().setHex("#000000", 0.2);
}

export default class SelectButton extends ButtonBase {
    private iconPos: Vec2 = new Vec2();
    private iconBoxRect: Rect = new Rect();

    constructor(id: number, label: string, settings: SelectButtonSettings) {
        super(id, label, settings);
        this.iconBoxRect.size.set(20, 20);
    }

    layoutAbsolute() {
        super.layoutAbsolute();
        this.iconPos = this.layoutRect.pos.clone();
        this.iconPos.x += this.layoutRect.size.x - 20;

        this.iconBoxRect.pos.copy(this.iconPos);

        this.iconPos.y += 2;
        this.iconPos.x += 2;
    }

    prepDraw() {
        super.prepDraw();
        let settings = this.settings as SelectButtonSettings;
        UI_I.currentDrawBatch.textBatch.addIcon(this.iconPos, 8, Color.white);
        UI_I.currentDrawBatch.fillBatch.addRect(
            this.iconBoxRect,
            settings.iconBoxColor
        );
    }
}

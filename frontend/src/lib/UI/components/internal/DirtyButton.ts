import Component, {ComponentSettings} from "../Component";
import Color from "../../math/Color";
import UI_I from "../../UI_I";

export class DirtyButtonSettings extends ComponentSettings {
    public disabledColor: Color = new Color().setHex("#aaaaaa", 1);
    public enabledColor: Color = new Color().setHex("#ff4c5a", 1);
    public overColor: Color = new Color().setHex("#d9303c", 1);

    constructor() {
        super();
        this.box.size.set(4, 20);
    }
}

export default class DirtyButton extends Component {
    valueDirty: boolean = false;

    constructor(id: number, settings: DirtyButtonSettings) {
        super(id, settings);
    }

    layoutAbsolute() {
        super.layoutAbsolute();
    }

    prepDraw() {
        let settings = this.settings as DirtyButtonSettings;
        let color = settings.disabledColor;
        if (this.valueDirty) {
            if (this.isOver) {
                color = settings.overColor;
            } else {
                color = settings.enabledColor;
            }
        }

        UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, color);
    }

    setValueDirty(val: boolean) {
        if (val == this.valueDirty) return;
        this.valueDirty = val;
        this.setDirty();
    }

    getReturnValue(): boolean {
        if (this.isClicked && this.valueDirty) return true;
        return false;
    }

    destroy() {
        super.destroy();
    }
}

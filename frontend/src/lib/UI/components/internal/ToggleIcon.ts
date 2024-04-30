import Component, {ComponentSettings} from "../Component";
import Color from "../../math/Color";
import UI_I from "../../UI_I";

export class ToggleIconSettings extends ComponentSettings {
    constructor() {
        super();
        this.box.size.set(18, 18);
        this.box.setMargin(2);
    }

    public colorOver: Color = new Color().setHex("#f6f6f6", 1);
    public color: Color = new Color().setHex("#c1c1c1", 1);
}

export default class ToggleIcon extends Component {
    private ref: any;
    private property: string;

    private changed: boolean = false;
    private iconTrue: number;
    private iconFalse: number;

    constructor(
        id: number,
        ref: any,
        property: string,
        iconTrue: number,
        iconFalse: number,
        settings: ToggleIconSettings
    ) {
        super(id, settings);

        this.size.copy(settings.box.size);
        this.iconTrue = iconTrue;
        this.iconFalse = iconFalse;
        this.ref = ref;
        this.property = property;
    }

    onMouseClicked() {
        super.onMouseClicked();

        this.ref[this.property] = !this.ref[this.property];
        this.changed = true;
        this.setDirty();
    }

    prepDraw() {
        let settings = this.settings as ToggleIconSettings;
        let color = settings.color;
        if (this.isOver) {
            color = settings.colorOver;
        }
        let icon = this.ref[this.property] ? this.iconTrue : this.iconFalse;

        UI_I.currentDrawBatch.textBatch.addIcon(this.layoutRect.pos, icon, color);
    }

    getReturnValue(): boolean {
        let change = this.changed;
        this.changed = false;
        return change;
    }
}

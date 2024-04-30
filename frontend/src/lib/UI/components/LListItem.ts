import ButtonBase, {ButtonBaseSettings} from "./internal/ButtonBase";

export class LListItemSettings extends ButtonBaseSettings {
    constructor() {
        super();
        this.box.size.y = 20;
        this.backColor.setHex("#2d2d2d", 1);
    }
}

export default class LListItem extends ButtonBase {
    private ro = -1;

    constructor(id: number, label: string, settings: LListItemSettings) {
        super(id, label, settings);
    }

    onAdded() {
        super.onAdded();
        if (this.ro == this.renderOrder) return;

        this.ro = this.renderOrder;
        if (this.renderOrder % 2 == 0) {
            (this.settings as LListItemSettings).backColor.a = 0.8;
        } else {
            (this.settings as LListItemSettings).backColor.a = 1;
        }
        this.setDirty();
    }

    setSelected(selected: boolean) {
        if (this.enabled == selected) {
            this.enabled = !selected;
            this.setDirty();
        }
    }
}

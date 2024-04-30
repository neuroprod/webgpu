import UI_I from "../UI_I";
import Component, {ComponentSettings} from "./Component";
import VerticalLayout, {VerticalLayoutSettings} from "./VerticalLayout";

import UI_IC from "../UI_IC";
import Local from "../local/Local";

export class GroupSettings extends ComponentSettings {
    constructor() {
        super();
        this.box.marginTop = 3;
        this.box.marginBottom = 0;
        this.box.marginLeft = UI_I.globalStyle.compIndent;
        this.box.paddingLeft = 10 * Math.min(UI_I.groupDepth, 1);
        this.box.size.y = 20;
    }
}

export default class Group extends Component {
    private container!: Component;

    private label: string;
    private verticalLSettings: VerticalLayoutSettings;
    private open: boolean = false;

    constructor(id: number, label: string, settings: GroupSettings) {
        super(id, settings);
        this.drawChildren = true;
        this.label = label;

        this.verticalLSettings = new VerticalLayoutSettings();
        this.verticalLSettings.needScrollBar = false;
        this.verticalLSettings.hasOwnDrawBatch = false;
        this.verticalLSettings.box.marginTop = 21;
        this.setFromLocal();
    }

    setFromLocal() {
        let data = Local.getItem(this.id);
        if (data) {
            this.open = data.open;
        }
    }

    saveToLocal() {
        let a = {
            open: this.open,
        };

        Local.setItem(this.id, a);
    }

    updateCursor(comp: Component) {
        if (comp instanceof Group || comp instanceof VerticalLayout) {
            this.placeCursor.y +=
                +comp.settings.box.marginTop +
                comp.size.y +
                comp.settings.box.marginBottom;
        } else {
            this.placeCursor.y = 0;
        }
    }

    needsResize(): boolean {
        if (this.size.y < this.placeCursor.y) {
            this.size.y = this.placeCursor.y;
        }
        if (this.size.y > this.placeCursor.y) {
            this.size.y = this.placeCursor.y;
        }

        return false;
    }

    setSubComponents() {
        super.setSubComponents();
        let open = UI_IC.groupTitle(this.label, this.open);
        if (open != this.open) {
            this.open = open;
            this.saveToLocal();
            this.setDirty(true);
        }

        UI_IC.dirtyButton("LSdb");
        UI_I.popComponent();

        UI_IC.pushVerticalLayout("l", this.verticalLSettings);
        this.container = UI_I.currentComponent;

        this.container.drawChildren = open;
    }
}

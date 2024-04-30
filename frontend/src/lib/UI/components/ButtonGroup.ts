import UI_I from "../UI_I";
import Component, {ComponentSettings} from "./Component";
import VerticalLayout, {VerticalLayoutSettings} from "./VerticalLayout";

import UI_IC from "../UI_IC";
import Local from "../local/Local";
import {ButtonBaseSettings} from "./internal/ButtonBase";
import Color from "../math/Color";
import Rect from "../math/Rect";

export class ButtonGroupSettings extends ComponentSettings {
    public color: Color;
    public hasChildren: boolean;

    constructor() {
        super();
        this.box.marginTop = 3;
        this.box.marginBottom = 0;
        this.box.marginLeft = UI_I.globalStyle.compIndent;
        this.box.paddingLeft = 10 * Math.min(UI_I.groupDepth, 1);
        this.box.size.y = 20;
        this.color = new Color().setHex("#000000", 0);
        this.hasChildren = false;
    }
}

export default class ButtonGroup extends Component {
    private container!: Component;

    private label: string;
    private verticalLSettings: VerticalLayoutSettings;
    private open: boolean = false;
    private isPressed: boolean = false;
    private drawRect: Rect;

    constructor(id: number, label: string, settings: ButtonGroupSettings) {
        super(id, settings);
        this.drawChildren = true;
        this.label = label;

        settings.box.paddingLeft = 10 * Math.min(UI_I.groupDepth, 1);
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
        if (comp instanceof ButtonGroup || comp instanceof VerticalLayout) {
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

    layoutAbsolute() {
        super.layoutAbsolute();

        this.drawRect = this.layoutRect.clone();
        this.drawRect.size.y = 20;
    }

    prepDraw() {
        if (this.layoutRect.size.x < 0) return;
        super.prepDraw();

        let b = this.settings as ButtonGroupSettings;
        UI_I.currentDrawBatch.fillBatch.addRect(this.drawRect, b.color);
    }

    setSubComponents() {
        super.setSubComponents();
        let b = this.settings as ButtonGroupSettings;
        let s = new ButtonBaseSettings()
        s.box.size.set(-1, 20)
        if (b.hasChildren) {
            if (UI_IC.toggleIcon("icon", this, "open", 1, 2)) {
                this.saveToLocal();
            }
            s.box.marginLeft = 20;
        }


        s.downColor.a = 0.5
        s.overColor.a = 0.5

        s.backColor.a = 0.0;
        this.isPressed = UI_IC.buttonBase(this.label, s)
        //let open = UI_IC.groupTitle(this.label, this.open);
        //if (open != this.open) {
        //  this.open = open;
        //this.saveToLocal();
        //this.setDirty(true);
        // }


        UI_IC.pushVerticalLayout("l", this.verticalLSettings);
        this.container = UI_I.currentComponent;

        this.container.drawChildren = this.open;
    }

    getReturnValue() {

        return this.isPressed;
    }
}

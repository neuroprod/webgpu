import LComponent, {LComponentSettings} from "./LComponent";
import UI_IC from "../UI_IC";

import {InputBaseSettings} from "./internal/InputBase";
import UI_I from "../UI_I";
import DirtyButton from "./internal/DirtyButton";

export class LTextInputSettings extends LComponentSettings {
    constructor() {
        super();
        this.canCopyToClipBoard = true;
    }
}

export default class LTextInput extends LComponent {
    private ref: any;
    private value: string;
    private valueOld: string;
    private prop: string;
    private inputSettings: InputBaseSettings;

    constructor(
        id: number,
        label: string,
        ref: any,
        prop: string,
        settings: LTextInputSettings
    ) {
        super(id, label, settings);
        this.prop = prop;
        this.ref = ref;
        if (typeof ref === "string") {
            this.value = ref;
        } else {
            this.value = ref[prop];
        }

        this.valueOld = this.value;
        this.inputSettings = new InputBaseSettings();
        this.inputSettings.box.marginLeft = 4;
    }

    setSubComponents() {
        super.setSubComponents();

        if (UI_IC.inputBase("ib", this, "value", this.inputSettings)) {
            if (this.value == this.valueOld) {
                this.setValueDirty(false);
            } else {
                this.setValueDirty(true);
            }
            if (typeof this.ref !== "string") {
                this.ref[this.prop] = this.value;
            }
        }
        if (UI_IC.dirtyButton("LSdb")) {
            this.value = this.valueOld;
            if (typeof this.ref !== "string") {
                this.ref[this.prop] = this.value;
            }
            this.setValueDirty(false);
        }

        let btn = UI_I.currentComponent as DirtyButton;
        btn.setValueDirty(this.valueDirty);
        UI_I.popComponent();
    }

    getReturnValue(): string {
        return this.value;
    }

    getClipboardValue(): string {
        return this.value;
    }
}

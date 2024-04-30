import LComponent, {LComponentSettings} from "./LComponent";

import UI_IC from "../UI_IC";
import UI_I from "../UI_I";
import DirtyButton from "./internal/DirtyButton";
import {DragBaseSettings} from "./internal/DragBase";
import {NumberType} from "../UI_Enums";
import UI_Vars from "../UI_Vars";
import {SettingsButtonSettings} from "./internal/SettingsButton";
import Local from "../local/Local";

export class LNumberSettings extends LComponentSettings {
    showDirty: boolean = true;
    showSettings: boolean = true;

    constructor() {
        super();
        this.canCopyToClipBoard = true;
    }
}

export default class LNumber extends LComponent {
    private value: number = 0;
    private stringRef: string;
    private ref: any;

    private type: NumberType;
    private valueOld: number;
    private dragSettings: DragBaseSettings;

    private showDirty: boolean;
    private showSettings: boolean;

    public step: number;
    public floatPrecision: number;

    constructor(
        id: number,
        label: string,
        value: number | null,
        ref: any,
        settings: LNumberSettings,
        type: NumberType = NumberType.FLOAT
    ) {
        super(id, label, settings);
        if (value) this.value = value;
        this.stringRef = label;
        this.ref = ref;

        this.type = type;

        if (this.type == NumberType.FLOAT) {
            this.floatPrecision = UI_Vars.floatPrecision;
        } else {
            this.floatPrecision = 0;
        }
        this.step = this.floatPrecision;
        this.setFromLocal();

        if (this.ref) {
            this.value = this.ref[this.stringRef];
        }
        this.valueOld = this.value;
        this.dragSettings = new DragBaseSettings();
        this.dragSettings.floatPrecision = this.floatPrecision;
        this.dragSettings.step = Math.pow(10, -this.step);
        this.showDirty = settings.showDirty;
        this.showSettings = settings.showSettings;
        if (settings.showDirty) this.dragSettings.box.marginLeft = 4;
        if (settings.showSettings)
            this.dragSettings.box.marginRight = SettingsButtonSettings.width;
    }

    onAdded() {
        if (this.ref) {
            this.value = this.ref[this.stringRef];
        }
    }

    setSubComponents() {
        super.setSubComponents();
        if (UI_IC.dragBase("LSsl", this, "value", this.type, this.dragSettings)) {
            if (this.valueOld != this.value) {
                this.setValueDirty(true);
            } else {
                this.setValueDirty(false);
            }
            if (this.ref) {
                this.ref[this.stringRef] = this.value;
            }
        }
        if (this.showDirty) {
            if (UI_IC.dirtyButton("LSdb")) {
                this.value = this.valueOld;
                if (this.ref) {
                    this.ref[this.stringRef] = this.value;
                }
                this.setDirty();
                this.setValueDirty(false);
            }
            let btn = UI_I.currentComponent as DirtyButton;
            btn.setValueDirty(this.valueDirty);
            UI_I.popComponent();
        }
        if (this.showSettings) {
            if (UI_IC.settingsButton("LSset")) {
                UI_IC.dragPopUp(this, this.layoutRect.pos, "LNumber Settings");
            }
        }
    }

    setFromSettings(precision: number, step: number) {
        this.floatPrecision = precision;
        this.step = step;
        this.dragSettings.floatPrecision = precision;
        this.dragSettings.step = Math.pow(10, -this.step);
        this.saveToLocal();
        this.setDirty();
    }

    setFromLocal() {
        let data = Local.getItem(this.id);
        if (data) {
            this.step = data.step;
            this.floatPrecision = data.pres;
        }
    }

    saveToLocal() {
        let a = {
            step: this.step,
            pres: this.floatPrecision,
        };
        Local.setItem(this.id, a);
    }

    getReturnValue(): number {
        return this.value;
    }

    getClipboardValue(): string {
        return this.value.toFixed(this.floatPrecision) + "";
    }
}

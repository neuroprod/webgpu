import LComponent, {LComponentSettings} from "./LComponent";

import {UI_VEC2, UI_VEC3, UI_VEC4} from "../UI_Types";
import {NumberType, VectorType} from "../UI_Enums";
import UI_IC from "../UI_IC";
import UI_I from "../UI_I";
import DirtyButton from "./internal/DirtyButton";
import {DragBaseSettings} from "./internal/DragBase";
import {ComponentSettings} from "./Component";
import UI_Vars from "../UI_Vars";
import {SettingsButtonSettings} from "./internal/SettingsButton";
import Local from "../local/Local";

export class LVectorSettings extends LComponentSettings {
    showDirty: boolean = true;
    showSettings: boolean = true;

    constructor() {
        super();
        this.canCopyToClipBoard = true;
    }
}

export default class LVector extends LComponent {
    private value: UI_VEC2 | UI_VEC3 | UI_VEC4;

    private type: VectorType;

    private showDirty: boolean;
    private showSettings: boolean;
    private numBoxes: number;
    private x: number = 0;
    private y: number = 0;
    private z: number = 0;
    private w: number = 0;
    private posXSettings: DragBaseSettings;
    private posYSettings: DragBaseSettings;
    private posZSettings: DragBaseSettings;
    private posWSettings: DragBaseSettings;
    private holderSettings: ComponentSettings;
    public floatPrecision: number;
    public step: number;
    private needNormalize: boolean = true;

    constructor(
        id: number,
        label: string,
        value: UI_VEC2 | UI_VEC3 | UI_VEC4,
        normalized: boolean = false,
        settings: LVectorSettings
    ) {
        super(id, label, settings);
        this.value = value;
        this.showDirty = settings.showDirty;
        this.showSettings = settings.showSettings;
        this.floatPrecision = UI_Vars.floatPrecision;
        this.step = this.floatPrecision;

        this.setFromLocal();

        this.type = VectorType.VEC2;
        this.numBoxes = 2;
        this.needNormalize = normalized;
        this.x = value.x;
        this.y = value.y;

        if (typeof (<UI_VEC3>this.value).z == "number") {
            this.type = VectorType.VEC3;
            this.numBoxes = 3;
            this.z = (<UI_VEC3>this.value).z;
        }
        if (typeof (<UI_VEC4>this.value).w == "number") {
            this.type = VectorType.VEC4;
            this.numBoxes = 4;
            this.w = (<UI_VEC4>this.value).w;
        }

        let size = -1 / this.numBoxes;
        let offsetSize = 1 / this.numBoxes;

        this.holderSettings = new ComponentSettings();
        if (this.showDirty) this.holderSettings.box.marginLeft = 4;
        if (this.showSettings)
            this.holderSettings.box.marginRight = SettingsButtonSettings.width;

        this.posXSettings = new DragBaseSettings();
        this.posXSettings.box.size.x = size;
        this.posXSettings.box.marginRight = 1;
        this.posXSettings.posOffsetRelative.x = 0;

        this.posYSettings = new DragBaseSettings();
        this.posYSettings.box.size.x = size;
        this.posYSettings.box.marginRight = 1;
        if (this.type == VectorType.VEC2) this.posYSettings.box.marginRight = 0;
        this.posYSettings.box.marginLeft = 1;
        this.posYSettings.posOffsetRelative.x = offsetSize;

        this.posZSettings = new DragBaseSettings();
        this.posZSettings.box.size.x = size;
        this.posZSettings.box.marginRight = 1;
        if (this.type == VectorType.VEC3) this.posZSettings.box.marginRight = 0;
        this.posZSettings.box.marginLeft = 1;
        this.posZSettings.posOffsetRelative.x = offsetSize * 2;

        this.posWSettings = new DragBaseSettings();
        this.posWSettings.box.size.x = size;
        this.posWSettings.box.marginRight = 0;
        this.posWSettings.box.marginLeft = 1;
        this.posWSettings.posOffsetRelative.x = offsetSize * 3;

        this.posXSettings.floatPrecision = this.floatPrecision;
        this.posXSettings.step = Math.pow(10, -this.step);

        this.posYSettings.floatPrecision = this.floatPrecision;
        this.posYSettings.step = Math.pow(10, -this.step);

        this.posZSettings.floatPrecision = this.floatPrecision;
        this.posZSettings.step = Math.pow(10, -this.step);

        this.posWSettings.floatPrecision = this.floatPrecision;
        this.posWSettings.step = Math.pow(10, -this.step);
    }

    setSubComponents() {
        super.setSubComponents();

        UI_IC.pushComponent("holder", this.holderSettings);
        if (
            UI_IC.dragBase("x", this.value, "x", NumberType.FLOAT, this.posXSettings)
        ) {
            if (this.x != this.value.x) {
                if (this.needNormalize) this.normalize();
                this.setValueDirty(true);
            } else {
                this.setValueDirty(false);
            }
        }

        if (
            UI_IC.dragBase("y", this.value, "y", NumberType.FLOAT, this.posYSettings)
        ) {
            if (this.y != this.value.y) {
                if (this.needNormalize) this.normalize();
                this.setValueDirty(true);
            } else {
                this.setValueDirty(false);
            }
        }
        if (this.type > VectorType.VEC2) {
            if (
                UI_IC.dragBase(
                    "z",
                    this.value,
                    "z",
                    NumberType.FLOAT,
                    this.posZSettings
                )
            ) {
                if (this.z != (this.value as UI_VEC3).z) {
                    if (this.needNormalize) this.normalize();
                    this.setValueDirty(true);
                } else {
                    this.setValueDirty(false);
                }
            }
        }
        if (this.type > VectorType.VEC3) {
            if (
                UI_IC.dragBase(
                    "w",
                    this.value,
                    "w",
                    NumberType.FLOAT,
                    this.posWSettings
                )
            ) {
                if (this.w != (this.value as UI_VEC4).w) {
                    if (this.needNormalize) this.normalize();
                    this.setValueDirty(true);
                } else {
                    this.setValueDirty(false);
                }
            }
        }

        UI_I.popComponent();
        if (this.showDirty) {
            if (UI_IC.dirtyButton("LSdb")) {
                this.value.x = this.x;
                this.value.y = this.y;
                if (this.type > VectorType.VEC2) {
                    // @ts-ignore
                    this.value.z = this.z;
                }
                if (this.type > VectorType.VEC3) {
                    // @ts-ignore
                    this.value.w = this.w;
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
                UI_IC.dragPopUp(this, this.layoutRect.pos, "LVector Settings");
            }
        }
    }

    setFromSettings(precision: number, step: number) {
        this.floatPrecision = precision;
        this.step = step;
        this.posXSettings.floatPrecision = this.floatPrecision;
        this.posXSettings.step = Math.pow(10, -this.step);

        this.posYSettings.floatPrecision = this.floatPrecision;
        this.posYSettings.step = Math.pow(10, -this.step);

        this.posZSettings.floatPrecision = this.floatPrecision;
        this.posZSettings.step = Math.pow(10, -this.step);

        this.posWSettings.floatPrecision = this.floatPrecision;
        this.posWSettings.step = Math.pow(10, -this.step);
        this.setDirty();
        this.saveToLocal();
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

    getReturnValue(): UI_VEC2 | UI_VEC3 | UI_VEC4 {
        return this.value;
    }

    getClipboardValue(): string {
        let f = this.floatPrecision;
        if (this.needNormalize) {
            f = 6;
        }
        let ret = this.value.x.toFixed(f) + ",";
        ret += this.value.y.toFixed(f);
        if (this.type > VectorType.VEC2) {
            // @ts-ignore
            ret += "," + this.value.z.toFixed(f);
        }
        if (this.type > VectorType.VEC3) {
            // @ts-ignore
            ret += "," + this.value.w.toFixed(f);
        }
        return ret;
    }

    private normalize() {
        this.value.normalize();
    }
}

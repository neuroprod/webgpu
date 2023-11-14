import LComponent, { LComponentSettings } from "./LComponent";
import UI_IC from "../UI_IC";

import { CheckBoxSettings } from "./internal/CheckBox";
import UI_I from "../UI_I";
import DirtyButton from "./internal/DirtyButton";

export class LBooleanSettings extends LComponentSettings {}

export default class LBoolean extends LComponent {
  private ref: any;
  private value: boolean;
  private checkBoxSettings: CheckBoxSettings;
  private valueOld: boolean;
  private labelCheck: string;

  constructor(
    id: number,
    label: string,
    value: boolean | null,
    ref: any,
    settings: LBooleanSettings
  ) {
    super(id, "", settings);
    this.labelCheck = label;
    if (ref == null && value!=null) {
      this.value = value;
    } else {
      this.value = ref[label];
    }
    this.valueOld = this.value;
    this.ref = ref;
    this.checkBoxSettings = new CheckBoxSettings();
    this.checkBoxSettings.box.marginLeft = 4;
  }

  setSubComponents() {
    super.setSubComponents();

    if (
      UI_IC.checkBox(this.labelCheck, this, "value", this.checkBoxSettings) !=
      this.valueOld
    ) {
      if (this.value == this.valueOld) {
        this.setValueDirty(false);
      } else {
        this.setValueDirty(true);
      }
    }

    if (UI_IC.dirtyButton("LSdb")) {
      this.value = this.valueOld;
      if (this.ref) {
        this.ref[this.labelCheck] = this.value;
      }
      this.setDirty();
      this.setValueDirty(false);
    }

    let btn = UI_I.currentComponent as DirtyButton;
    btn.setValueDirty(this.valueDirty);
    UI_I.popComponent();
  }

  getReturnValue(): boolean {
    return this.value;
  }
}

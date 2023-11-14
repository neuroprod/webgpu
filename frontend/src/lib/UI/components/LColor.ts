import LComponent, { LComponentSettings } from "./LComponent";
import UI_IC from "../UI_IC";
import Color from "../math/Color";

import { ColorButtonSettings } from "./internal/ColorButton";
import { ColorPickerPopupSettings } from "./internal/popUps/ColorPickerPopUp";
import UI_I from "../UI_I";
import DirtyButton from "./internal/DirtyButton";
import { UI_COLOR } from "../UI_Types";

export class LColorSettings extends LComponentSettings {
  constructor() {
    super();
    this.canCopyToClipBoard = true;
  }
}

export default class LColor extends LComponent {
  public color: Color;
  public colorStart: Color = new Color();
  private colorButtonSettings: ColorButtonSettings;
  private popUpSettings: ColorPickerPopupSettings;
  private colorUI: UI_COLOR;

  constructor(
    id: number,
    label: string,
    color: UI_COLOR,
    settings: LColorSettings
  ) {
    super(id, label, settings);
    this.colorUI = color;
    this.color = new Color(
      this.colorUI.r,
      this.colorUI.g,
      this.colorUI.b,
      this.colorUI.a
    );
    this.colorStart.copy(this.color);
    this.colorButtonSettings = new ColorButtonSettings();
    this.colorButtonSettings.box.marginLeft = 4;

    this.popUpSettings = new ColorPickerPopupSettings();
  }

  setSubComponents() {
    super.setSubComponents();

    if (UI_IC.colorButton("cb", this.color, this.colorButtonSettings)) {
      let x = this.layoutRect.pos.x + this.settings.box.paddingLeft;
      let y = this.layoutRect.pos.y;
      if (UI_I.screenSize.y / 2 < this.layoutRect.pos.y) {
        this.popUpSettings.box.marginTop =
          this.layoutRect.pos.y - this.popUpSettings.box.size.y - 5;
      } else {
        this.popUpSettings.box.marginTop = this.layoutRect.pos.y + 25;
      }
      this.popUpSettings.box.marginLeft =
        this.layoutRect.pos.x + this.settings.box.paddingLeft;
      let offset =
        this.popUpSettings.box.marginLeft +
        this.popUpSettings.box.size.x -
        UI_I.screenSize.x +
        10;
      if (offset > 0) {
        this.popUpSettings.box.marginLeft -= offset;
      }

      UI_IC.colorPickerPopUp(this, this.popUpSettings);
    }

    if (UI_IC.dirtyButton("LSdb")) {
      this.color.copy(this.colorStart);
      this.updateUIColor();
      this.setDirty();
      this.setValueDirty(false);
    }
    let btn = UI_I.currentComponent as DirtyButton;
    btn.setValueDirty(this.valueDirty);
    UI_I.popComponent();
  }

  getReturnValue(): UI_COLOR {
    return this.colorUI;
  }

  getClipboardValue(): string {
    return (
      this.color.r.toFixed(2) +
      "," +
      this.color.g.toFixed(2) +
      "," +
      this.color.b.toFixed(2) +
      "," +
      this.color.a.toFixed(2)
    );
  }

  updateUIColor() {
    this.colorUI.r = this.color.r;
    this.colorUI.g = this.color.g;
    this.colorUI.b = this.color.b;
    this.colorUI.a = this.color.a;
  }
}

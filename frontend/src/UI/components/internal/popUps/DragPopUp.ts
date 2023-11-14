import UI_I from "../../../UI_I";
import UI_IC from "../../../UI_IC";

import Vec2 from "../../../math/Vec2";
import LNumber from "../../LNumber";
import { ComponentSettings } from "../../Component";
import { ButtonBaseSettings } from "../ButtonBase";
import { HAlign } from "../../../UI_Enums";
import PopUpWindow, { PopUpWindowSettings } from "./PopUpWindow";
import LVector from "../../LVector";
import { LSliderSettings } from "../../LSlider";

export class DragPopUpSettings extends PopUpWindowSettings {
  constructor() {
    super();
    this.box.size.set(350, 200);
  }
}

export default class DragPopUp extends PopUpWindow {
  private comp: LNumber | LVector;

  private btnOkSettings: ButtonBaseSettings;
  private btnCancelSettings: ButtonBaseSettings;


  private hCompBtnSettings: ComponentSettings;
  private precision: number;
  private sliderSettings: LSliderSettings;
  private step: number;

  constructor(
    id: number,
    comp: LNumber | LVector,
    pos: Vec2,
    name: string,
    settings: DragPopUpSettings
  ) {
    super(id, name, settings);
    this.posOffset.copy(pos);
    this.comp = comp;

    this.btnOkSettings = new ButtonBaseSettings();
    this.btnOkSettings.box.size.x = 95;
    this.btnOkSettings.box.hAlign = HAlign.RIGHT;
    this.btnOkSettings.box.marginTop = 1.5;
    this.btnOkSettings.box.marginBottom = 1.5;

    this.btnCancelSettings = new ButtonBaseSettings();
    this.btnCancelSettings.box.size.x = 95;
    this.btnCancelSettings.box.hAlign = HAlign.RIGHT;
    this.btnCancelSettings.box.marginRight = 100;
    this.btnCancelSettings.box.marginTop = 1.5;
    this.btnCancelSettings.box.marginBottom = 1.5;

    this.sliderSettings = new LSliderSettings();
    this.sliderSettings.showDirty = false;
    this.sliderSettings.showSettings = false;

    this.hCompBtnSettings = new ComponentSettings();
    this.hCompBtnSettings.box.size.y = 23;
    this.hCompBtnSettings.box.marginTop = 20;
    this.btnOkSettings = new ButtonBaseSettings();
    this.btnOkSettings.box.size.x = 95;
    this.btnOkSettings.box.hAlign = HAlign.RIGHT;
    this.btnOkSettings.box.marginTop = 1.5;
    this.btnOkSettings.box.marginBottom = 1.5;

    this.precision = this.comp.floatPrecision;
    this.step = this.comp.step;
    //this.box.paddingLeft = UI_I.globalStyle.getLabelSize()
    // this.box.marginLeft
  }

  setPopupContent() {
    UI_IC.pushVerticalLayout("v");

    UI_IC.LIntSlider(this, "precision", 0, 7, this.sliderSettings);
    UI_IC.LText(Math.pow(10, -this.precision).toFixed(this.precision));

    UI_IC.LIntSlider(this, "step", -7, 7, this.sliderSettings);
    UI_IC.LText(Math.pow(10, -this.step).toFixed(Math.max(this.step, 0)) + " "); //could be the same id as prev ltext

    UI_IC.pushComponent("ok", this.hCompBtnSettings);
    if (UI_IC.buttonBase("Cancel", this.btnCancelSettings)) {
      UI_I.removePopup(this);
    }

    if (UI_IC.buttonBase("OK", this.btnOkSettings)) {
      this.comp.setFromSettings(this.precision, this.step);
      UI_I.removePopup(this);
    }
    UI_I.popComponent();
    UI_I.popComponent();
  }
}

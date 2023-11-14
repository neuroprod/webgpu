import UI_I from "../../../UI_I";
import UI_IC from "../../../UI_IC";
import Vec2 from "../../../math/Vec2";
import { ComponentSettings } from "../../Component";
import { ButtonBaseSettings } from "../ButtonBase";
import { HAlign } from "../../../UI_Enums";
import PopUpWindow, { PopUpWindowSettings } from "./PopUpWindow";
import Viewport from "../../Viewport";
import LListItem from "../../LListItem";
import SelectItem from "../../../math/SelectItem";
import UI from "../../../UI";

export class ViewportPopUpSettings extends PopUpWindowSettings {
  constructor() {
    super();
    this.box.size.set(300, 200);
  }
}

export default class ViewportPopUp extends PopUpWindow {
  private viewport: Viewport;

  private btnOkSettings: ButtonBaseSettings;
  private btnCancelSettings: ButtonBaseSettings;
  private hCompBtnSettings: ComponentSettings;
  private oldRatio: Vec2;
  private index = 0;

  constructor(
    id: number,
    viewport: Viewport,
    pos: Vec2,
    settings: ViewportPopUpSettings
  ) {
    super(id, "Viewport Settings", settings);
    this.posOffset.copy(pos);
    this.viewport = viewport;

    this.oldRatio = this.viewport.currentRatio.clone();
    for (let i = 0; i < this.viewport.selectItems.length; i++) {
      if (this.oldRatio.equal(this.viewport.selectItems[i].value)) {
        this.index = i;
        break;
      }
    }

    this.hCompBtnSettings = new ComponentSettings();
    this.hCompBtnSettings.box.size.y = 23;
    this.hCompBtnSettings.box.marginTop = 20;

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
  }

  setPopupContent() {
    UI_IC.pushVerticalLayout("v");

    this.viewport.currentRatio = UI_IC.LSelect(
      "ratio",
      this.viewport.selectItems,
      this.index
    );

    UI_IC.pushComponent("ok", this.hCompBtnSettings);
    if (UI_IC.buttonBase("Cancel", this.btnCancelSettings)) {
      this.viewport.currentRatio.copy(this.oldRatio);
      UI_I.removePopup(this);
    }

    if (UI_IC.buttonBase("OK", this.btnOkSettings)) {
      this.viewport.saveToLocal();
      UI_I.removePopup(this);
    }
    UI_I.popComponent();
    UI_I.popComponent();
  }
}

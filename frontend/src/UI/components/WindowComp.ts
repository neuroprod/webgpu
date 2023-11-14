import Panel, { PanelSettings } from "./Panel";
import { VerticalLayoutSettings } from "./VerticalLayout";

import UI_I from "../UI_I";
import UI_IC from "../UI_IC";

export class WindowSettings extends PanelSettings {}

export default class WindowComp extends Panel {
  private contentVLSetting: VerticalLayoutSettings;

  constructor(id: number, label: string, settings: WindowSettings) {
    super(id, label, settings);
    this.contentVLSetting = new VerticalLayoutSettings();
    this.contentVLSetting.box.marginTop = 24;
  }

  setIsDockedInPanel(value: boolean) {
    super.setIsDockedInPanel(value);
    if (value) {
      this.contentVLSetting.box.marginTop = 0;
    } else {
      this.contentVLSetting.box.marginTop = 24;
    }
  }

  setSubComponents() {
    if (!this.isDockedInPanel) super.setSubComponents();

    UI_IC.pushVerticalLayout("panelVert", this.contentVLSetting);

    UI_I.currentComponent.drawChildren = !this.collapsed;
  }
}

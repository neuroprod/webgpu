import Color from "../../../math/Color";
import { ComponentSettings } from "../../Component";
import LColor from "../../LColor";
import UI_IC from "../../../UI_IC";
import { ColorButtonSettings } from "../ColorButton";
import PopUpWindow, { PopUpWindowSettings } from "./PopUpWindow";

export class ColorPickerPopupSettings extends PopUpWindowSettings {
  constructor() {
    super();
    this.box.size.set(310 + 7 + 100 + 7 + 100 + 20, 256 + 20 + 22);
  }
}

export default class ColorPickerPopUp extends PopUpWindow {
  private color: Color;
  private colorPrev: Color = new Color();
  private comp: LColor;
  private infoCompSettings: ComponentSettings;
  private curSet: ColorButtonSettings;
  private prevSet: ColorButtonSettings;

  constructor(id: number, comp: LColor, settings: ColorPickerPopupSettings) {
    super(id, "Color", settings);
    this.comp = comp;
    this.color = comp.color;
    this.colorPrev.copy(comp.color);

    this.infoCompSettings = new ComponentSettings();
    this.infoCompSettings.hasBackground = true;
    this.infoCompSettings.box.setPadding(3);
    this.infoCompSettings.backgroundColor = new Color().setHex("#000000", 0.1);

    this.curSet = new ColorButtonSettings();
    this.curSet.box.marginLeft = 310 + 7;
    this.curSet.box.size.set(100, 60);

    this.prevSet = new ColorButtonSettings();
    this.prevSet.box.marginLeft = 310 + 7 + 100 + 7;
    this.prevSet.box.size.set(100, 60);
  }

  setPopupContent() {
    if (UI_IC.colorPicker("cp", this.color)) {
      this.comp.updateUIColor();
      this.comp.setValueDirty(true);
    }

    UI_IC.colorButton("curCol", this.color, this.curSet);

    if (UI_IC.colorButton("prevCol", this.colorPrev, this.prevSet)) {
      this.color.copy(this.colorPrev);
      this.comp.updateUIColor();
      this.comp.setValueDirty(false);
      this.setDirty();
    }

    /* UI.pushPlaceComponent("place",this.infoRect.size,this.infoRect.pos,this.infoCompSettings);
         UI.pushVerticalLayout("vert");

         UI_I.globalStyle.setLabelSize(45)

         UI_I.globalStyle.resetLabelSize();
         UI.popComponent();
         UI.popComponent();*/
  }

  layoutAbsolute() {
    super.layoutAbsolute();
    if (this.isDirty) this.comp.setDirty(true);
  }
}

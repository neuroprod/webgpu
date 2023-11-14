import PopUp, { PopUpSettings } from "./PopUp";
import Color from "../../../math/Color";
import UI_I from "../../../UI_I";
import Font from "../../../draw/Font";
import Rect from "../../../math/Rect";
import Vec2 from "../../../math/Vec2";
import UI_IC from "../../../UI_IC";
import { ComponentSettings } from "../../Component";
import { IconButtonSettings } from "../IconButton";
import { HAlign } from "../../../UI_Enums";

export class PopUpWindowSettings extends PopUpSettings {
  public labelColor: Color = new Color().setHex("#d8d8d8", 1);
  public topBarColor: Color = new Color().setHex("#2b2927", 1);
  public topBarHeight = 22;

  constructor() {
    super();
    // this.box.setPadding(10)
    // this.box.paddingTop = 22+10;
    this.popUpBackground.setHex("#403f3e", 1);
  }
}

export default class PopUpWindow extends PopUp {
  private topBarRect: Rect = new Rect();
  private labelPos: Vec2 = new Vec2();
  private label: string;
  private isDragging: boolean = false;
  private startDragPos: Vec2 = new Vec2();
  private holderSettings: ComponentSettings;
  private closeButtonSettings: IconButtonSettings;

  constructor(id: number, label: string, settings: PopUpWindowSettings) {
    super(id, settings);
    this.label = label;
    this.holderSettings = new ComponentSettings();
    this.holderSettings.box.setMargin(10);
    this.holderSettings.box.marginTop = 22 + 10;
    this.closeButtonSettings = new IconButtonSettings();
    this.closeButtonSettings.box.hAlign = HAlign.RIGHT;
    this.closeButtonSettings.box.setMargin(1);
    this.closeButtonSettings.transparent = true;
  }

  setSubComponents() {
    super.setSubComponents();
    if (UI_IC.iconButton("test", 10, this.closeButtonSettings)) {
      UI_I.removePopup(this);
    }

    UI_IC.pushComponent("holder", this.holderSettings);
    this.setPopupContent();
    UI_I.popComponent();
  }

  public setPopupContent() {}

  layoutAbsolute() {
    super.layoutAbsolute();
    let settings = this.settings as PopUpWindowSettings;
    this.topBarRect.copyPos(this.layoutRect.pos);
    this.topBarRect.setSize(this.layoutRect.size.x, settings.topBarHeight);

    this.labelPos.set(
      this.posAbsolute.x + settings.box.paddingLeft + 5,
      this.posAbsolute.y + settings.topBarHeight / 2 - Font.charSize.y / 2
    );
  }

  onMouseDown() {
    if (this.topBarRect.contains(UI_I.mouseListener.mousePos)) {
      this.isDragging = true;
      this.startDragPos.copy(this.posOffset);
    }
  }

  onMouseUp() {
    this.isDragging = false;
  }

  updateOnMouseDown() {
    if (this.isDragging) {
      let dir = UI_I.mouseListener.mousePosDown.clone();
      dir.sub(UI_I.mouseListener.mousePos);
      let newPos = this.startDragPos.clone();
      newPos.sub(dir);
      this.posOffset.copy(newPos);

      this.setDirty(true);
    }

    if (this.isDragging) {
      this.setDirty();
    }
  }

  prepDraw() {
    super.prepDraw();
    let settings = this.settings as PopUpWindowSettings;
    UI_I.currentDrawBatch.fillBatch.addRect(
      this.topBarRect,
      settings.topBarColor
    );
    UI_I.currentDrawBatch.textBatch.addLine(
      this.labelPos,
      this.label,
      1000,
      settings.labelColor
    );
  }
}

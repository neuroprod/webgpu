import Component, { ComponentSettings } from "../Component";
import Color from "../../math/Color";
import Utils from "../../math/Utils";
import UI_I from "../../UI_I";
import Vec2 from "../../math/Vec2";
import Font from "../../draw/Font";
import { HAlign, NumberType } from "../../UI_Enums";
import UI_Vars from "../../UI_Vars";
import UI_IC from "../../UI_IC";
import { IconButtonSettings } from "./IconButton";
import { InputBaseSettings } from "./InputBase";

export class DragBaseSettings extends ComponentSettings {
  colorBack = new Color().setHex("#4c4c4c", 1);
  labelColor = new Color().gray(0.8);
  posOffsetRelative: Vec2 = new Vec2();
  floatPrecision: number = 2;
  step: number = 0.01;

  constructor() {
    super();
    this.hasBackground = true;
    this.backgroundColor.setHex("#2d2d2d", 1);
  }
}

export default class DragBase extends Component {
  value: number;

  private textMaxWidth: number = 0;
  private textPos: Vec2 = new Vec2();

  private isDragging: boolean = false;

  private ref: any;
  private objName: string;
  private type: NumberType;
  private changed: boolean = false;
  private label!: string;
  private startMouseX!: number;

  private textLength!: number;
  private iconBtnRightSettings: IconButtonSettings;
  private inputSettings: InputBaseSettings;
  private showInput: boolean = false;
  private valueString!: string;

  constructor(
    id: number,
    ref: any,
    objName: string,
    type: NumberType,
    settings: DragBaseSettings
  ) {
    super(id, settings);

    this.ref = ref;
    this.objName = objName;

    this.value = ref[objName];
    this.posOffsetRelative = settings.posOffsetRelative;
    this.type = type;

    this.iconBtnRightSettings = new IconButtonSettings();
    this.iconBtnRightSettings.box.marginLeft = 21;
    this.iconBtnRightSettings.box.hAlign = HAlign.RIGHT;

    this.inputSettings = new InputBaseSettings();
    this.inputSettings.autoFocus = true;
    this.inputSettings.filter = InputBaseSettings.floatFilter;
  }

  onAdded() {
    super.onAdded();
    if (this.value != this.ref[this.objName]) {
      this.value = this.ref[this.objName];
      this.setDirty();
    }
  }

  onMouseDown() {
    this.startMouseX = UI_I.mouseListener.mousePos.x;
    // this.isDragging = true;
  }

  onMouseUp() {
    if (!this.isDragging) {
      if (
        this.startMouseX > this.textPos.x &&
        this.startMouseX < this.textPos.x + this.textLength
      ) {
        this.showInput = true;
        this.valueString = this.value.toFixed(
          (this.settings as DragBaseSettings).floatPrecision
        );
      }
    }

    this.isDragging = false;
  }

  updateOnMouseDown() {
    if (!this.isDragging) {
      let valueChange = UI_I.mouseListener.mousePos.x - this.startMouseX;
      if (valueChange != 0) this.isDragging = true;
    }

    if (this.isDragging) {
      let valueChange = UI_I.mouseListener.mousePos.x - this.startMouseX;
      if (valueChange == 0) return;
      this.startMouseX = UI_I.mouseListener.mousePos.x;

      this.value += valueChange * (this.settings as DragBaseSettings).step; //*Math.sign(valueChange);
      this.ref[this.objName] = this.value;

      this.changed = true;
      this.setDirty(true);
    }
  }

  layoutAbsolute() {
    super.layoutAbsolute();

    this.textMaxWidth = this.layoutRect.size.x - 20;
    this.textPos.copy(this.layoutRect.pos);

    this.label = this.value.toFixed(
      (this.settings as DragBaseSettings).floatPrecision
    );

    this.textLength = Math.min(
      this.textMaxWidth,
      Font.charSize.x * this.label.length
    );

    this.textPos.x += Utils.getCenterPlace(
      this.textLength,
      this.layoutRect.size.x
    );
    this.textPos.y += Utils.getCenterPlace(
      Font.charSize.y,
      this.layoutRect.size.y
    );
  }

  prepDraw() {
    super.prepDraw();
    if (this.showInput) return;
    let settings = this.settings as DragBaseSettings;

    if (this.isOverChild || this.isDown) {
      UI_I.currentDrawBatch.fillBatch.addRect(
        this.layoutRect,
        settings.colorBack
      );
    }

    UI_I.currentDrawBatch.textBatch.addLine(
      this.textPos,
      this.label,
      this.textMaxWidth,
      settings.labelColor
    );
  }

  setSubComponents() {
    super.setSubComponents();

    if (this.showInput) {
      if (
        UI_IC.inputBase("ib", this, "valueString", this.inputSettings, true)
      ) {
        let v = Number.parseFloat(this.valueString);
        if (!isNaN(v)) {
          this.value = v;
          this.ref[this.objName] = this.value;
          this.changed = true;
          this.setDirty(true);
        }
      }
      if (UI_I.focusComponent != UI_I.currentComponent) this.showInput = false;
      UI_I.popComponent();
    } else if (this.isOverChild || this.isDown) {
      if (UI_IC.iconButton("left", 4)) {
        this.value -= (this.settings as DragBaseSettings).step;
        this.ref[this.objName] = this.value;
        this.changed = true;
        this.setDirty(true);
      }
      if (UI_IC.iconButton("right", 3, this.iconBtnRightSettings)) {
        this.value += (this.settings as DragBaseSettings).step;
        this.ref[this.objName] = this.value;
        this.changed = true;
        this.setDirty(true);
      }
    }
  }

  showSettings(): void {
    console.log("implement settings popup");
  }

  getReturnValue(): boolean {
    let change = this.changed;
    this.changed = false;
    return change;
  }
}

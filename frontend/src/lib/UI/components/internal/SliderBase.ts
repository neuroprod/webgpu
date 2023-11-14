import Component, { ComponentSettings } from "../Component";
import Color from "../../math/Color";
import Utils from "../../math/Utils";
import UI_I from "../../UI_I";
import Vec2 from "../../math/Vec2";
import Rect from "../../math/Rect";
import Font from "../../draw/Font";
import { NumberType } from "../../UI_Enums";

export class SliderBaseSettings extends ComponentSettings {
  barColor = new Color().setHex("#65625e", 1);
  labelColor = Color.white.clone();
  min: number = 0;
  max: number = 1;
  type: NumberType = NumberType.FLOAT;
  floatPrecision: number = 2;
  isDirty: boolean = false;

  constructor() {
    super();
    this.hasBackground = true;
    this.backgroundColor.setHex("#2d2d2d", 1);
  }
}

export default class SliderBase extends Component {
  private value: number;
  private startValue: number;
  private textMaxWidth: number = 0;
  private textPos: Vec2 = new Vec2();
  private barRect: Rect = new Rect();

  private valueNorm: number = 0;
  private isDragging: boolean = false;

  private ref: any;
  private objName: string;

  private changed: boolean = false;

  constructor(
    id: number,
    ref: any,
    objName: string,
    settings: SliderBaseSettings
  ) {
    super(id, settings);

    this.ref = ref;
    this.objName = objName;

    this.value = ref[objName];
    this.startValue = this.value;

    this.updateValue();
  }

  updateValue() {
    let settings = this.settings as SliderBaseSettings;
    if (settings.type == NumberType.INT) {
      this.value = Math.round(this.value);
      this.startValue = Math.round(this.value);
    }

    if (this.value < settings.min) settings.min = this.value;
    if (this.value > settings.max) settings.max = this.value;

    if (settings.type == NumberType.INT) {
      settings.min = Math.round(settings.min);
      settings.max = Math.round(settings.max);
    }

    this.valueNorm =
      (this.value - settings.min) / (settings.max - settings.min);
    this.setDirty();
  }

  onAdded() {
    if (this.value != this.ref[this.objName]) {
      this.value = this.ref[this.objName];
      this.startValue = this.value;
      this.updateValue();
    }
    if ((this.settings as SliderBaseSettings).isDirty) {
      (this.settings as SliderBaseSettings).isDirty = false;
      this.updateValue();
    }
  }

  updateMouse() {
    if (this.isDown) {
      if (this.isDownThisFrame) {
        this.isDragging = true;
      }
    } else {
      this.isDragging = false;
    }
  }

  updateOnMouseDown() {
    if (this.isDragging) {
      let settings = this.settings as SliderBaseSettings;
      this.valueNorm =
        (UI_I.mouseListener.mousePos.x - this.layoutRect.pos.x) /
        this.layoutRect.size.x;
      this.valueNorm = Math.max(Math.min(this.valueNorm, 1), 0);
      this.value =
        this.valueNorm * (settings.max - settings.min) + settings.min;
      if (settings.type == NumberType.INT) {
        this.value = Math.round(this.value);
        this.valueNorm =
          (this.value - settings.min) / (settings.max - settings.min);
      }
      this.value = Number.parseFloat(
        this.value.toFixed(settings.floatPrecision)
      );

      this.ref[this.objName] = this.value;

      this.changed = true;
      this.setDirty(true);
    }
  }

  layoutAbsolute() {
    super.layoutAbsolute();
    this.barRect.copy(this.layoutRect);
    this.barRect.size.x = this.valueNorm * this.layoutRect.size.x;
    this.textMaxWidth = this.layoutRect.size.x;
    this.textPos.copy(this.layoutRect.pos);
    this.textPos.x += 5;
    this.textPos.y += Utils.getCenterPlace(
      Font.charSize.y,
      this.layoutRect.size.y
    );
  }

  prepDraw() {
    super.prepDraw();
    let settings = this.settings as SliderBaseSettings;

    UI_I.currentDrawBatch.fillBatch.addRect(this.barRect, settings.barColor);

    let label = this.value.toFixed(settings.floatPrecision);

    UI_I.currentDrawBatch.textBatch.addLine(
      this.textPos,
      label,
      this.textMaxWidth,
      settings.labelColor
    );
  }

  getReturnValue(): boolean {
    let change = this.changed;
    this.changed = false;
    return change;
  }
}

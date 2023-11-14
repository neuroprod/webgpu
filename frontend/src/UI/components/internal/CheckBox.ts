import Component, { ComponentSettings } from "../Component";
import Color from "../../math/Color";
import Vec2 from "../../math/Vec2";
import UI_I from "../../UI_I";
import Rect from "../../math/Rect";
import Utils from "../../math/Utils";
import Font from "../../draw/Font";

export class CheckBoxSettings extends ComponentSettings {
  public labelColor: Color = new Color().setHex("#bfbfbf", 1);
  public colorRect: Color = new Color().setHex("#2d2d2d", 1);

  constructor() {
    super();
    this.box.size.set(-1, 20);
  }
}

export default class CheckBox extends Component {
  private label: string;

  private ref: any;
  private property: string;

  private checkPos: Vec2 = new Vec2();
  private checkRect: Rect = new Rect();
  private textPos: Vec2 = new Vec2();
  private maxTextSize!: number;
  private changed!: boolean;

  constructor(
    id: number,
    label: string,
    ref: any,
    property: string,
    settings: CheckBoxSettings
  ) {
    super(id, settings);

    this.label = label;
    this.ref = ref;
    this.property = property;
  }

  onMouseClicked() {
    super.onMouseClicked();
    this.ref[this.property] = !this.ref[this.property];
    this.changed = true;
  }

  layoutRelative() {
    super.layoutRelative();

    let settings = this.settings as CheckBoxSettings;
    let ts = Font.getTextSize(this.label).x + 20 + 5;
    if (this.size.x > ts) {
      this.size.x = ts;
    }
  }

  layoutAbsolute() {
    this.checkRect.copy(this.layoutRect);
    this.checkRect.size.x = 20;
    this.checkPos.copy(this.layoutRect.pos);

    let s = Utils.getCenterPlace(Font.iconSize.y, 20);
    this.checkPos.x += s;
    this.checkPos.y += s;
    this.textPos.x = this.layoutRect.pos.x + 20 + 5;
    this.textPos.y =
      this.layoutRect.pos.y + Utils.getCenterPlace(Font.charSize.y, 20);
    this.maxTextSize = this.layoutRect.size.x - 20 - 5;
  }

  prepDraw() {
    let settings = this.settings as CheckBoxSettings;
    if (this.ref[this.property]) {
      UI_I.currentDrawBatch.textBatch.addIcon(this.checkPos, 0, Color.white);
    }

    UI_I.currentDrawBatch.fillBatch.addRect(this.checkRect, settings.colorRect);
    UI_I.currentDrawBatch.textBatch.addLine(
      this.textPos,
      this.label,
      this.maxTextSize,
      settings.labelColor
    );
  }

  getReturnValue(): boolean {
    let change = this.changed;
    this.changed = false;
    return change;
  }
}

import Component, { ComponentSettings } from "./Component";
import UI_I from "../UI_I";
import Color from "../math/Color";
import Font from "../draw/Font";
import Vec2 from "../math/Vec2";
import Utils from "../math/Utils";
import Rect from "../math/Rect";

export class SeparatorSettings extends ComponentSettings {
  public labelColor: Color = new Color().setHex("#FFFFFF", 1);
  public lineColor: Color = new Color().setHex("#505050", 1);
  public labelPaddingLeft = UI_I.globalStyle.getLabelSize();
  constructor() {
    super();
    this.box.marginTop = 1.5;
    this.box.marginBottom = 1.5;

    this.box.size.set(-1, 20);
  }
}

export default class Separator extends Component {
  protected label: string;

  private maxLabelWidth: number=0;
  private labelPos = new Vec2();

  private showLabel: boolean;
  private lineRectLeft: Rect = new Rect();
  private lineRectRight: Rect = new Rect();

  constructor(
    id: number,
    label: string,
    showLabel: boolean,
    settings: SeparatorSettings
  ) {
    super(id, settings);
    this.label = label;
    this.showLabel = showLabel;

    this.size.copy(settings.box.size); //size X is set later
    if (!this.showLabel) this.size.y /= 2;
    this.lineRectLeft.size.y = this.lineRectRight.size.y = 1;
  }

  layoutRelative() {
    super.layoutRelative();
    let settings = this.settings as SeparatorSettings;
    if (settings.box.size.x == -1)
      this.size.x =
        Utils.getMaxInnerWidth(this.parent) -
        settings.box.marginLeft -
        settings.box.marginRight;
    if (settings.box.size.y == -1)
      this.size.y =
        Utils.getMaxInnerHeight(this.parent) -
        settings.box.marginTop -
        settings.box.marginRight;
  }

  layoutAbsolute() {
    if (!this.label.length) return;

    let settings = this.settings as SeparatorSettings;
    this.lineRectLeft.pos.copy(this.layoutRect.pos);
    if (this.showLabel) {
      let ts = Font.getTextSize(this.label);
      this.maxLabelWidth =
        this.layoutRect.size.x - settings.labelPaddingLeft - 10;
      this.labelPos.copy(this.layoutRect.pos);
      this.labelPos.x += settings.labelPaddingLeft; //align right

      this.lineRectRight.pos.copy(this.labelPos);
      this.lineRectRight.pos.x += Math.min(ts.x, this.maxLabelWidth) + 5;
      this.lineRectRight.size.x =
        this.layoutRect.size.x -
        (this.lineRectRight.pos.x - this.layoutRect.pos.x);
      this.lineRectRight.pos.y += this.layoutRect.size.y / 2;

      this.labelPos.y += Math.floor(
        Utils.getCenterPlace(Font.charSize.y, settings.box.size.y)
      );
      this.lineRectLeft.size.x = settings.labelPaddingLeft - 15;
    } else {
      //this.lineRectLeft.pos.y+=2;
      this.lineRectLeft.size.x = this.layoutRect.size.x - 5;
    }
    this.lineRectLeft.pos.x += 5;
    this.lineRectLeft.pos.y += this.layoutRect.size.y / 2;
  }

  prepDraw() {
    super.prepDraw();
    if (!this.label.length) return;

    let settings = this.settings as SeparatorSettings;
    if (this.showLabel) {
      UI_I.currentDrawBatch.textBatch.addLine(
        this.labelPos,
        this.label,
        this.maxLabelWidth,
        settings.labelColor
      );
      UI_I.currentDrawBatch.fillBatch.addRect(
        this.lineRectRight,
        settings.lineColor
      );
    }
    UI_I.currentDrawBatch.fillBatch.addRect(
      this.lineRectLeft,
      settings.lineColor
    );
  }
}

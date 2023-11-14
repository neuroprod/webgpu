import Component, { ComponentSettings } from "./Component";
import UI_I from "../UI_I";
import Color from "../math/Color";
import Font from "../draw/Font";
import Vec2 from "../math/Vec2";
import Utils from "../math/Utils";
import UI from "../UI";
import UI_IC from "../UI_IC";

export class LComponentSettings extends ComponentSettings {
  public labelOverColor: Color = new Color().setHex("#bfbfbf", 1);
  public labelColor: Color = new Color().setHex("#bfbfbf", 1);
  public labelPaddingRight = 8;
  public labelPaddingLeft = 5;
  public canCopyToClipBoard = false;

  constructor() {
    super();
    this.box.marginTop = 1.5;
    this.box.marginBottom = 1.5;

    this.box.paddingLeft = UI_I.globalStyle.getLabelSize();
    this.box.marginLeft = UI_I.globalStyle.compIndent;
    this.box.size.set(-1, 20);
  }
}

export default class LComponent extends Component {
  valueDirty: boolean = false;
  protected label: string;
  private maxLabelWidth: number=0;
  private labelPos = new Vec2();
  private iconPos = new Vec2();
  constructor(id: number, label: string, settings: LComponentSettings) {
    super(id, settings);
    this.label = label;
    this.size.copy(settings.box.size); //size X is set later
  }

  layoutAbsolute() {
    if (!this.label.length) return;

    let settings = this.settings as LComponentSettings;
    let textSize = Font.getTextSize(this.label);

    this.maxLabelWidth =
      settings.box.paddingLeft -
      settings.labelPaddingRight -
      settings.labelPaddingLeft;
    if (this.isOver && settings.canCopyToClipBoard) {
      this.iconPos.copy(this.layoutRect.pos);
      this.iconPos.y += 2;
      this.iconPos.x += 5;
      this.maxLabelWidth -= 10;
    }
    let labelLength = Math.min(textSize.x, this.maxLabelWidth);

    this.labelPos.copy(this.layoutRect.pos);
    this.labelPos.x +=
      settings.box.paddingLeft - labelLength - settings.labelPaddingRight; //align right
    this.labelPos.y += Math.floor(Utils.getCenterPlace(textSize.y, 20));
    this.iconPos.x = this.labelPos.x - 15;
  }

  onMouseClicked() {
    if ((this.settings as LComponentSettings).canCopyToClipBoard) {
      navigator.clipboard.writeText(this.getClipboardValue()).then(
        () => {
          UI_IC.logEvent("Copy", this.getClipboardValue());
        },
        function (err) {
          UI_IC.logEvent(
            "Copy",
            "Async: Could not copy to clipboard:" + err,
            true
          );
        }
      );
    }
  }

  getClipboardValue(): string {
    return "overwrite me please";
  }

  prepDraw() {
    super.prepDraw();
    if (!this.label.length) return;

    let settings = this.settings as LComponentSettings;
    UI_I.currentDrawBatch.textBatch.addLine(
      this.labelPos,
      this.label,
      this.maxLabelWidth,
      settings.labelColor
    );
    if (this.isOver && settings.canCopyToClipBoard) {
      UI_I.currentDrawBatch.textBatch.addIcon(
        this.iconPos,
        9,
        settings.labelOverColor
      );
      UI_I.currentDrawBatch.textBatch.addLine(
        this.labelPos,
        this.label,
        this.maxLabelWidth,
        settings.labelOverColor
      );
    } else {
      UI_I.currentDrawBatch.textBatch.addLine(
        this.labelPos,
        this.label,
        this.maxLabelWidth,
        settings.labelColor
      );
    }
  }

  setValueDirty(val: boolean) {
    if (val == this.valueDirty) return;
    this.valueDirty = val;
    //propagate
  }
}

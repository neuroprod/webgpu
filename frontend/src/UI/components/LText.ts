import LComponent, { LComponentSettings } from "./LComponent";
import UI_IC from "../UI_IC";
import Utils from "../math/Utils";
import Font from "../draw/Font";
import UI_I from "../UI_I";
import Color from "../math/Color";
import Vec2 from "../math/Vec2";

export class LTextSettings extends LComponentSettings {
  public textColor: Color = new Color().setHex("#ffffff", 1);
}
export default class LText extends LComponent {
  private text: string;
  private multiLine: boolean;
  private textPos: Vec2 = new Vec2();
  private maxTextWidth: number = 0;
  private lines: Array<string> = [];
  constructor(
    id: number,
    label: string,
    text: string,
    multiLine: boolean,
    settings: LTextSettings
  ) {
    super(id, label, settings);
    this.text = text;
    this.multiLine = multiLine;
  }
  layoutRelative() {
    super.layoutRelative();
    let settings = this.settings as LTextSettings;
    if (this.multiLine) {
      this.maxTextWidth = this.size.x - settings.box.paddingLeft - 10;
      this.makeLines();
      this.size.y = settings.box.size.y;
      this.size.y += (this.lines.length - 1) * (Font.charSize.y + 2);
    }
  }

  layoutAbsolute() {
    super.layoutAbsolute();
    let settings = this.settings as LTextSettings;

    this.textPos.copy(this.layoutRect.pos);
    this.textPos.x += settings.box.paddingLeft;
    this.textPos.y += Math.floor(
      Utils.getCenterPlace(Font.charSize.y, settings.box.size.y)
    );
    this.maxTextWidth = this.layoutRect.size.x - settings.box.paddingLeft - 10;
  }

  prepDraw() {
    super.prepDraw();
    let settings = this.settings as LTextSettings;
    if (this.multiLine) {
      this.textPos.copy(this.layoutRect.pos);
      this.textPos.x += settings.box.paddingLeft;
      this.textPos.y += Math.floor(
        Utils.getCenterPlace(Font.charSize.y, settings.box.size.y)
      );
      for (let line of this.lines) {
        UI_I.currentDrawBatch.textBatch.addLine(
          this.textPos,
          line,
          this.maxTextWidth,
          settings.textColor
        );
        this.textPos.y += Font.charSize.y + 2;
      }
    } else {
      UI_I.currentDrawBatch.textBatch.addLine(
        this.textPos,
        this.text,
        this.maxTextWidth,
        settings.textColor
      );
    }
  }

  private makeLines() {
    this.lines = [];
    let charWith = Font.charSize.x;
    let maxChars = Math.floor(this.maxTextWidth / charWith);
    let words = this.text.split(" ");
    let line = "";
    for (let word of words) {
      if (word.length + 1 + line.length < maxChars) {
        line += word + " ";
      } else {
        this.lines.push(line);
        line = word + " ";
      }
    }
    this.lines.push(line);
  }
}

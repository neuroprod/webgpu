import Vec2 from "../math/Vec2";
import Color from "../math/Color";
import Rect from "../math/Rect";
import Font, { Char } from "./Font";

export default class TextBatch {
  public indices: Array<number> = [];
  public vertices: Array<number> = [];
  private indicesPos: number = 0;
  constructor() {}
  addIcon(pos: Vec2, id: number, color: Color) {
    //pos.round()
    let rect: Rect = new Rect(pos, Font.iconSize);
    let char = Font.icons[id];
    this.addChar(rect, char, color);
  }

  addLine(pos: Vec2, text: string, maxSize: number, color: Color) {
    let startPos = pos.clone();
    startPos.round();

    let maxChars = Math.floor(maxSize / Font.charSize.x);
    if (maxChars < 1) return;
    let cutText = false;
    if (text.length > maxChars) {
      cutText = true;
      let clipLength = maxChars - 1;
      if (text.at(clipLength - 1) == " ") {
        clipLength--;
      }
      text = text.slice(0, clipLength);
    }

    let rect = new Rect(startPos, Font.charSize);
    for (let i = 0; i < text.length; i++) {
      let c = text.charCodeAt(i);
      if (c > 127) continue;
      c -= 32;
      let char = Font.chars[c];
      this.addChar(rect, char, color);
      startPos.x += Font.charSize.x;
      rect.pos = startPos.clone();
    }
    if (cutText) {
      let char = Font.chars[127 - 32];
      this.addChar(rect, char, color);
    }
  }

  addChar(rect: Rect, char: Char, color: Color) {
    this.vertices = this.vertices.concat(
      rect.getTopLeft().getArray(),
      char.uv0.getArray(),
      color.getArray(),
      rect.getTopRight().getArray(),
      char.uv1.getArray(),
      color.getArray(),
      rect.getBottomRight().getArray(),
      char.uv2.getArray(),
      color.getArray(),
      rect.getBottomLeft().getArray(),
      char.uv3.getArray(),
      color.getArray()
    );

    this.indices.push(
      this.indicesPos,
      this.indicesPos + 1,
      this.indicesPos + 2
    );
    this.indices.push(
      this.indicesPos,
      this.indicesPos + 2,
      this.indicesPos + 3
    );
    this.indicesPos += 4;
  }
  clear() {
    this.indices = [];
    this.vertices = [];
    this.indicesPos = 0;
  }
}

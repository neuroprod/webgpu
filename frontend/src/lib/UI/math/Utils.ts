import Rect from "./Rect";
import Color from "./Color";
import UI_I from "../UI_I";
import Component from "../components/Component";

export default class Utils {
  public static drawOutlineRect(target: Rect, color: Color) {
    let lineRect = new Rect();
    lineRect.copy(target);
    lineRect.pos.x -= 1;
    lineRect.pos.y -= 1;
    lineRect.size.x += 2;
    lineRect.size.y += 2;
    UI_I.currentDrawBatch.fillBatch.addRect(lineRect, color);
  }
  public static drawInLineRect(target: Rect, color: Color) {
    let lineRect = new Rect();
    lineRect.copy(target);
    lineRect.pos.x += 1;
    lineRect.pos.y += 1;
    lineRect.size.x -= 2;
    lineRect.size.y -= 2;
    UI_I.currentDrawBatch.fillBatch.addRect(lineRect, color);
  }

  static clamp(min: number, max: number, value: number) {
    return Math.min(Math.max(min, value), max);
  }

  static getMaxInnerWidth(parent: Component | null) {
    if (!parent) return Number.MAX_VALUE;
    return (
      parent.size.x -
      parent.settings.box.paddingLeft -
      parent.settings.box.paddingRight
    );
  }
  static getMaxInnerHeight(parent: Component | null) {
    if (!parent) return Number.MAX_VALUE;
    return (
      parent.size.y -
      parent.settings.box.paddingTop -
      parent.settings.box.paddingBottom
    );
  }

  static getCenterPlace(placeSize: number, roomSize: number) {
    return (roomSize - placeSize) / 2;
  }
}

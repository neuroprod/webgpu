import Vec2 from "./Vec2";
import { HAlign } from "../UI_Enums";

export default class Box {
  public marginRight = 0;
  public marginLeft = 0;
  public marginTop = 0;
  public marginBottom = 0;

  public paddingRight = 0;
  public paddingLeft = 0;
  public paddingTop = 0;
  public paddingBottom = 0;
  public size = new Vec2(-1, -1);
  public hAlign = HAlign.LEFT;
  constructor() {}

  setPadding(val: number) {
    this.paddingRight = val;
    this.paddingLeft = val;
    this.paddingTop = val;
    this.paddingBottom = val;
  }

  setMargin(val: number) {
    this.marginRight = val;
    this.marginLeft = val;
    this.marginTop = val;
    this.marginBottom = val;
  }
}

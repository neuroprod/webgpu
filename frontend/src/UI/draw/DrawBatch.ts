import FillBatch from "./FillBatch";
import Rect from "../math/Rect";
import TextBatch from "./TextBatch";
import TextureBatch from "./TextureBatch";

export default class DrawBatch {
  public isDirty: boolean = false;
  public fillBatch = new FillBatch();
  public textBatch = new TextBatch();
  public textureBatch = new TextureBatch();
  public parent: DrawBatch | null = null;
  public children: Array<DrawBatch> = [];
  public id: number;
  public clipRect!: Rect | null;
  public needsClipping: boolean = false;

  public useThisUpdate: boolean = true;

  constructor(id: number, clipRect: Rect | null = null) {
    this.id = id;
    this.clipRect = clipRect;
  }

  removeFromParent() {
    if(this.parent)
    this.parent.removeChild(this);
  }
  removeChild(drawBatch: DrawBatch) {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i] == drawBatch) {
        this.children.splice(i, 1);
        break;
      }
    }
    drawBatch.fillBatch.clear();
    drawBatch.textBatch.clear();
    drawBatch.textureBatch.clear();
    drawBatch.parent = null;
  }
  addChild(drawBatch:DrawBatch) {
    if (drawBatch.parent) {
      drawBatch.removeFromParent();
    }
    drawBatch.parent = this;
    this.children.push(drawBatch);
    this.isDirty = true;
  }

  clear() {
    if (this.isDirty) {
      this.fillBatch.clear();
      this.textBatch.clear();
      this.textureBatch.clear();
    }
  }
  collectBatches(array: Array<DrawBatch>) {
    if (!this.useThisUpdate && this.parent) {
      return;
    }

    if (this.clipRect) {
      if (this.clipRect.size.x == 0) return;
      if (this.fillBatch.indices.length + this.textBatch.indices.length > 0) {
        array.push(this);
      }
      //array.push(this);
    }

    for (let child of this.children) {
      child.collectBatches(array);
    }
  }
}

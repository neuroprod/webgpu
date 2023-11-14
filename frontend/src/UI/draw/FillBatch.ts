import Vec2 from "../math/Vec2";
import Color from "../math/Color";
import Rect from "../math/Rect";

export default class FillBatch {
  public indices: Array<number> = [];
  public vertices: Array<number> = [];
  private indicesPos: number = 0;
  private shadowRect = new Rect();
  private shadowSizeRect = new Rect();
  private shadowColorIn = new Color(0, 0, 0, 0.1);
  private shadowColorOut = new Color(0, 0, 0, 0);
  private shadowOffset = 1;
  private shadowSize = 3;

  constructor() {}

  addTriangle(p1: Vec2, p2: Vec2, p3: Vec2, color: Color) {
    this.vertices = this.vertices.concat(
      p1.getArray(),
      color.getArray(),
      p2.getArray(),
      color.getArray(),
      p3.getArray(),
      color.getArray()
    );
    this.indices.push(
      this.indicesPos,
      this.indicesPos + 1,
      this.indicesPos + 2
    );
    this.indicesPos += 3;
  }

  addRect(rect: Rect, color: Color) {
    if (rect.size.x < 0) return;
    //rect.round()

    this.vertices = this.vertices.concat(
      rect.getTopLeft().getArray(),
      color.getArray(),
      rect.getTopRight().getArray(),
      color.getArray(),
      rect.getBottomRight().getArray(),
      color.getArray(),
      rect.getBottomLeft().getArray(),
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

  addShadow(rect: Rect) {
    return;
    this.shadowRect.copy(rect);
    this.shadowRect.pos.x += this.shadowOffset;
    this.shadowRect.pos.y += this.shadowOffset;
    this.shadowSizeRect.copy(this.shadowRect);
    this.shadowSizeRect.pos.x -= this.shadowSize;
    this.shadowSizeRect.pos.y -= this.shadowSize;
    this.shadowSizeRect.size.x += this.shadowSize * 2;
    this.shadowSizeRect.size.y += this.shadowSize * 2;
    // this.vertexData.push(new VertexDataFill(this.shadowRect.getTopLeft(), this.shadowColorIn), new VertexDataFill(this.shadowRect.getTopRight(), this.shadowColorIn), new VertexDataFill(this.shadowRect.getBottomRight(), this.shadowColorIn), new VertexDataFill(this.shadowRect.getBottomLeft(), this.shadowColorIn));
    //this.vertexData.push(new VertexDataFill(this.shadowSizeRect.getTopLeft(), this.shadowColorOut), new VertexDataFill(this.shadowSizeRect.getTopRight(), this.shadowColorOut), new VertexDataFill(this.shadowSizeRect.getBottomRight(), this.shadowColorOut), new VertexDataFill(this.shadowSizeRect.getBottomLeft(), this.shadowColorOut));

    const index = this.indicesPos;

    this.indices.push(index, index + 1, index + 2);
    this.indices.push(index, index + 2, index + 3);

    this.indices.push(index, index + 4, index + 5);
    this.indices.push(index, index + 5, index + 1);

    this.indices.push(index + 3, index + 2, index + 7);
    this.indices.push(index + 2, index + 6, index + 7);

    this.indices.push(index + 4, index, index + 3);
    this.indices.push(index + 4, index + 3, index + 7);

    this.indices.push(index + 1, index + 5, index + 6);
    this.indices.push(index + 1, index + 6, index + 2);
    this.indicesPos += 8;
  }

  clear() {
    this.vertices = [];
    this.indices = [];
    this.indicesPos = 0;
  }

  addRectHGradient(rect: Rect, colorL: Color, colorR: Color) {
    if (rect.size.x < 0) return;
    // rect.round()

    this.vertices = this.vertices.concat(
      rect.getTopLeft().getArray(),
      colorL.getArray(),
      rect.getTopRight().getArray(),
      colorR.getArray(),
      rect.getBottomRight().getArray(),
      colorR.getArray(),
      rect.getBottomLeft().getArray(),
      colorL.getArray()
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

  addRectVGradient(rect: Rect, colorT: Color, colorB: Color) {
    if (rect.size.x < 0) return;
    // rect.round()
    this.vertices = this.vertices.concat(
      rect.getTopLeft().getArray(),
      colorT.getArray(),
      rect.getTopRight().getArray(),
      colorT.getArray(),
      rect.getBottomRight().getArray(),
      colorB.getArray(),
      rect.getBottomLeft().getArray(),
      colorB.getArray()
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

  makeHueRect(hueRect: Rect) {
    let ryRect = hueRect.clone();
    ryRect.size.y /= 6;
    let offset = ryRect.size.y;
    this.addRectVGradient(ryRect, new Color(1, 0, 0, 1), new Color(1, 1, 0, 1));
    let ygRect = ryRect.clone();
    ygRect.pos.y += offset;
    this.addRectVGradient(ygRect, new Color(1, 1, 0, 1), new Color(0, 1, 0, 1));
    let gcRect = ygRect.clone();
    gcRect.pos.y += offset;
    this.addRectVGradient(gcRect, new Color(0, 1, 0, 1), new Color(0, 1, 1, 1));
    let cbRect = gcRect.clone();
    cbRect.pos.y += offset;
    this.addRectVGradient(cbRect, new Color(0, 1, 1, 1), new Color(0, 0, 1, 1));
    let bpRect = cbRect.clone();
    bpRect.pos.y += offset;
    this.addRectVGradient(bpRect, new Color(0, 0, 1, 1), new Color(1, 0, 1, 1));
    let prRect = bpRect.clone();
    prRect.pos.y += offset;
    this.addRectVGradient(prRect, new Color(1, 0, 1, 1), new Color(1, 0, 0, 1));
  }

  makeAlphaGrid(rect: Rect) {
    this.addRect(rect, new Color().gray(0.7));
    let size = 10;
    let hSteps = Math.ceil(rect.size.x / size);
    let vSteps = Math.ceil(rect.size.y / size);
    let rY = vSteps * size - rect.size.y;
    let rX = hSteps * size - rect.size.x;
    let pos = rect.pos.clone();
    let color = new Color().gray(1.0);
    for (let y = 0; y < vSteps; y++) {
      pos.x = rect.pos.x;

      let modY = y % 2;
      let hSize = size;
      let vSize = size;
      for (let x = 0; x < hSteps; x++) {
        let modX = (x + modY) % 2;
        if (modX == 0) {
          let rect = new Rect();
          rect.pos.copy(pos);
          hSize = size;
          vSize = size;
          if (y == vSteps - 1) {
            vSize -= rY;
          }
          if (x == hSteps - 1) {
            hSize -= rX;
          }
          rect.size.set(hSize, vSize);
          this.addRect(rect, color);
        }
        pos.x += size;
      }
      pos.y += size;
    }
  }
}

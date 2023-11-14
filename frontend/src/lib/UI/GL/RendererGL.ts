import FillRenderer from "./FillRenderer";

import DrawBatch from "../draw/DrawBatch";
import DrawBatchGL from "./DrawBatchGL";
import TextRenderer from "./TextRenderer";
import TextureRenderer from "./TextureRenderer";
import UI_I from "../UI_I";

export default class RendererGL {
  gl!: WebGL2RenderingContext | WebGLRenderingContext;
  private canvas!: HTMLCanvasElement;

  private fillRenderer!: FillRenderer;
  public textRenderer!: TextRenderer;
  private textureRenderer!: TextureRenderer;

  private drawArray: Array<DrawBatchGL> = [];
  private drawBatchesGL: Map<number, DrawBatchGL> = new Map<
    number,
    DrawBatchGL
  >();

  constructor() {}

  delete(id: number) {
    if (this.drawBatchesGL.has(id)) {
      let drawBatch = this.drawBatchesGL.get(id);
      if (drawBatch) {
        drawBatch.destroy();
        this.drawBatchesGL.delete(id);
        this.drawArray.splice(this.drawArray.indexOf(drawBatch), 1);
      }
    }
  }

  init(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    canvas: HTMLCanvasElement
  ) {
    this.canvas = canvas;
    this.gl = gl;

    this.fillRenderer = new FillRenderer(gl);
    this.textRenderer = new TextRenderer(gl);
    this.textureRenderer = new TextureRenderer(gl);
  }

  setDrawBatches(drawBatches: Array<DrawBatch>) {
    for (let a of this.drawArray) {
      a.useThisUpdate = false;
    }

    let tempArr = [];
    for (let batch of drawBatches) {
      let id = batch.id;

      let drawBatch = this.drawBatchesGL.get(id);
      if (drawBatch) {
        if (batch.isDirty) {
          drawBatch.setBatchData(batch);
        }
        drawBatch.useThisUpdate = true;
        tempArr.push(drawBatch);
      } else {
        let drawBatch = new DrawBatchGL(batch.id, this.gl);
        drawBatch.setBatchData(batch);
        this.drawBatchesGL.set(batch.id, drawBatch);
        drawBatch.useThisUpdate = true;
        tempArr.push(drawBatch);
      }

      batch.isDirty = false;
    }
    for (let a of this.drawArray) {
      if (!a.useThisUpdate) {
        a.destroy();
        this.drawBatchesGL.delete(a.id);
      }
    }

    this.drawArray = tempArr;
  }

  draw() {
    UI_I.numDrawCalls = 0;

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.disable(this.gl.DEPTH_TEST);

    let vpSize = UI_I.screenSize;

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    for (let batch of this.drawArray) {
      if (batch.needsClipping && batch.clipRect) {
        if (batch.clipRect.size.x < 1 || batch.clipRect.size.y < 1) continue;

        this.gl.enable(this.gl.SCISSOR_TEST);
        this.gl.scissor(
          batch.clipRect.pos.x * UI_I.pixelRatio,
          UI_I.screenSize.y * UI_I.pixelRatio -
            (batch.clipRect.pos.y + batch.clipRect.size.y) * UI_I.pixelRatio,
          batch.clipRect.size.x * UI_I.pixelRatio,
          batch.clipRect.size.y * UI_I.pixelRatio
        );
      }
      if (batch.fillBatchGL) {
        this.fillRenderer.draw(vpSize, batch.fillBatchGL);
      }
      if (batch.textureBatch) {
        this.textureRenderer.draw(vpSize, batch.textureBatch);
      }

      if (batch.textBatchGL) {
        this.textRenderer.draw(vpSize, batch.textBatchGL);
      }
      if (batch.needsClipping) {
        this.gl.disable(this.gl.SCISSOR_TEST);
      }
    }
  }
}

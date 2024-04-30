import DrawBatch from "../draw/DrawBatch";
import FillBatchGL from "./FillBatchGL";
import TextBatchGL from "./TextBatchGL";
import TextureBatch from "../draw/TextureBatch";
import Rect from "../math/Rect";

export default class DrawBatchGL {
    public id: number;
    public fillBatchGL: FillBatchGL | null = null;
    public textBatchGL: TextBatchGL | null = null;
    public textureBatch: TextureBatch | null = null;
    private gl: WebGL2RenderingContext | WebGLRenderingContext;
    public clipRect!: Rect | null;
    public needsClipping: boolean = false;
    public useThisUpdate: boolean = true;

    constructor(id: number, gl: WebGL2RenderingContext | WebGLRenderingContext) {
        this.gl = gl;
        this.id = id;
    }

    setBatchData(batch: DrawBatch) {
        this.clipRect = batch.clipRect;
        this.needsClipping = batch.needsClipping;
        if (batch.fillBatch) {
            if (!this.fillBatchGL) this.fillBatchGL = new FillBatchGL(this.gl);
            this.fillBatchGL.setRenderData(batch.fillBatch);
        }
        if (batch.textBatch) {
            if (!this.textBatchGL) this.textBatchGL = new TextBatchGL(this.gl);
            this.textBatchGL.setRenderData(batch.textBatch);
        }
        if (batch.textureBatch) {
            this.textureBatch = batch.textureBatch;
        }
    }

    destroy() {
        if (this.fillBatchGL) {
            this.fillBatchGL.destroy();
        }
        if (this.textBatchGL) {
            this.textBatchGL.destroy();
        }
    }
}

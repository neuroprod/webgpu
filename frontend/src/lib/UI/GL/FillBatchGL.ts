import FillBatch from "../draw/FillBatch";

export default class FillBatchGL {
    private gl: WebGL2RenderingContext | WebGLRenderingContext;
    vertexBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    private firstV = true;
    private firstI = true;
    private vertexSize = 0;
    numIndices = 0;

    constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
        this.gl = gl;
        this.vertexBuffer = <WebGLBuffer>gl.createBuffer();
        this.indexBuffer = <WebGLBuffer>gl.createBuffer();
    }

    destroy() {
        if (this.vertexBuffer) this.gl.deleteBuffer(this.vertexBuffer);
        if (this.indexBuffer) this.gl.deleteBuffer(this.indexBuffer);
        this.numIndices = 0;
    }

    setRenderData(fillBatch: FillBatch) {
        const gl = this.gl;

        if (fillBatch.indices.length > this.numIndices) {
            this.firstI = true;
        }
        this.numIndices = fillBatch.indices.length;

        let buffer = new ArrayBuffer(this.vertexSize);
        let dv = new DataView(buffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(fillBatch.vertices),
            gl.DYNAMIC_DRAW
        );
        /*if (this.firstV) {
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( fillBatch.vertices), gl.DYNAMIC_DRAW);
            } else {

                gl.bufferSubData(gl.ARRAY_BUFFER, 0,new Float32Array( fillBatch.vertices));
            }*/

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        if (this.firstI) {
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(fillBatch.indices),
                gl.DYNAMIC_DRAW
            );
        } else {
            gl.bufferSubData(
                gl.ELEMENT_ARRAY_BUFFER,
                0,
                new Uint16Array(fillBatch.indices)
            );
        }
    }
}

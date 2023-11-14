import FillBatch from "../draw/FillBatch";

export default class FillBatchGPU {
  public vertexBuffer!: GPUBuffer;
  public indexBuffer!: GPUBuffer;
  numIndices: number = 0;
  numVertices: number = 0;
  private device: GPUDevice;

  constructor(device: GPUDevice) {
    this.device = device;

    // this.vertexBuffer = gl.createBuffer();
    // this.indexBuffer = gl.createBuffer();
  }

  destroy() {
    if (this.vertexBuffer) this.vertexBuffer.destroy();
    if (this.indexBuffer) this.indexBuffer.destroy();
    this.numIndices = 0;
  }

  async setRenderData(fillBatch: FillBatch) {
    if (fillBatch.indices.length == 0) {
      if (this.numIndices > 0) this.destroy();
      return;
    }

    this.numIndices = fillBatch.indices.length;

    // console.log(fillBatch.indices.length)
    // console.log(fillBatch.vertices.length)
    //TODO reuse buffers if posible
    // https://toji.dev/webgpu-best-practices/buffer-uploads.html
    ////vertices

    let vertices = new Float32Array(fillBatch.vertices);
    this.numVertices = fillBatch.vertices.length;

    if (this.vertexBuffer) this.vertexBuffer.destroy();
    this.vertexBuffer = this.device.createBuffer({
      label: "UI_fill_vertexBuffer",
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    });
    const dstV = new Float32Array(this.vertexBuffer.getMappedRange());
    dstV.set(vertices);

    this.vertexBuffer.unmap();

    ////indices
    let indices = new Uint16Array(fillBatch.indices);

    let size = Math.ceil(indices.byteLength / 4) * 4;
    if (this.indexBuffer) this.indexBuffer.destroy();
    this.indexBuffer = this.device.createBuffer({
      size: size,
      usage: GPUBufferUsage.INDEX,
      mappedAtCreation: true,
    });

    const dstI = new Uint16Array(this.indexBuffer.getMappedRange());
    dstI.set(indices);

    this.indexBuffer.unmap();
    this.indexBuffer.label = "UI_fill_indexBuffer";
  }
}

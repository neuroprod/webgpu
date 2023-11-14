import Program from "./Program";

export default class Quad {
  public gl: WebGL2RenderingContext | WebGLRenderingContext;
  private planeVertexBuffer: WebGLBuffer;
  private PlaneUVBuffer: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
    this.planeVertexBuffer = <WebGLBuffer>gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.planeVertexBuffer);
    const vertices = [
      -1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.PlaneUVBuffer = <WebGLBuffer>gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.PlaneUVBuffer);
    const textureCoords = [0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0];
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(textureCoords),
      gl.STATIC_DRAW
    );
  }

  draw(program: Program) {
    if (program.program) {
      let gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.planeVertexBuffer);
      gl.vertexAttribPointer(program.vertexAttribute, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.PlaneUVBuffer);
      gl.vertexAttribPointer(program.uvAttribute0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
}

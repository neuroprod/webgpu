import FillBatchGL from "./FillBatchGL";
import Vec2 from "../math/Vec2";
import UI_I from "../UI_I";

export default class FillRenderer {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;

  private vertexShader!: WebGLShader;
  private fragmentShader!: WebGLShader;
  private program!: WebGLProgram;
  private vertexAttributeLoc!: GLint;
  private colorAttributeLoc!: GLint;
  private viewportSizeUniformLoc!: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
    this.makeProgram();

    // this.vbo = gl.createBuffer();
    //this.indexBuffer = gl.createBuffer();
  }
  draw(viewportSize: Vec2, fillBatch: FillBatchGL) {
    if (fillBatch.numIndices == 0) return;
    const gl = this.gl;

    gl.useProgram(this.program);
    gl.uniform2fv(this.viewportSizeUniformLoc, [
      (1 / viewportSize.x) * 2,
      (1 / viewportSize.y) * 2,
    ]);

    gl.enableVertexAttribArray(this.vertexAttributeLoc);
    gl.enableVertexAttribArray(this.colorAttributeLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, fillBatch.vertexBuffer);
    gl.vertexAttribPointer(this.vertexAttributeLoc, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(this.colorAttributeLoc, 4, gl.FLOAT, false, 24, 8);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fillBatch.indexBuffer);
    gl.drawElements(gl.TRIANGLES, fillBatch.numIndices, gl.UNSIGNED_SHORT, 0);

    gl.disableVertexAttribArray(this.vertexAttributeLoc);
    gl.disableVertexAttribArray(this.colorAttributeLoc);
    UI_I.numDrawCalls++;
  }
  makeProgram() {
    let vertex =
      "attribute  vec2 aVertex;\n" +
      "attribute  vec4 aColor;\n" +
      "varying vec4 vColor;\n" +
      "uniform vec2 uViewport;\n" +
      "void main(void){\n" +
      "gl_Position =vec4((aVertex)*uViewport -1.0,0.0,1.0);\n" +
      "gl_Position.y *=-1.0;\n" +
      "vColor =aColor;\n" +
      "}";

    let fragment =
      "precision lowp float;\n" +
      " varying vec4 vColor;\n" +
      " void main(void){\n" +
      " gl_FragColor=vColor;\n" +
      " gl_FragColor.xyz*=vColor.w;\n" +
      "}";

    this.compileProgram(vertex, fragment);
  }
  compileProgram(vertex: string, fragment: string) {
    const gl = this.gl;

    this.vertexShader = <WebGLShader>(
      this.compileShader(vertex, gl.VERTEX_SHADER)
    );
    this.fragmentShader = <WebGLShader>(
      this.compileShader(fragment, gl.FRAGMENT_SHADER)
    );

    this.program = <WebGLProgram>gl.createProgram();
    gl.attachShader(this.program, this.vertexShader);
    gl.attachShader(this.program, this.fragmentShader);

    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.log("Could not initialise shaders ");
    }
    gl.useProgram(this.program);
    this.vertexAttributeLoc = gl.getAttribLocation(this.program, "aVertex");
    this.colorAttributeLoc = gl.getAttribLocation(this.program, "aColor");
    this.viewportSizeUniformLoc = <WebGLUniformLocation>(
      gl.getUniformLocation(this.program, "uViewport")
    );
  }
  compileShader(text: string, type: number) {
    const gl = this.gl;

    let shader = <WebGLShader>gl.createShader(type);

    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log("shader error " + type + " " + gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }
}

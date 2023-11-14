import FontTexture from "./FontTexture";
import TextureBatch from "../draw/TextureBatch";
import Vec2 from "../math/Vec2";
import UI_I from "../UI_I";

export default class TextRenderer {
  private texture: FontTexture;
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private vertexShader!: WebGLShader;
  private fragmentShader!: WebGLShader;
  private program!: WebGLProgram;
  private vertexAttributeLoc!: GLint;
  private colorAttributeLoc!: GLint;
  private uvAttributeLoc!: GLint;
  private viewportSizeUniformLoc!: WebGLUniformLocation;

  private scaleUVUniformLoc!: WebGLUniformLocation;
  private offsetUVUniformLoc!: WebGLUniformLocation;
  private alphaUniformLoc!: WebGLUniformLocation;
  private textureLoc!: WebGLUniformLocation;

  private vertexBuffer!: WebGLBuffer;
  private posSizeUniformLoc!: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
    this.texture = new FontTexture(gl);
    this.makeProgram();
    this.makeBuffers();
  }
  draw(viewportSize: Vec2, textureBatch: TextureBatch) {
    if (textureBatch.textureData.length == 0) return;

    const gl = this.gl;
    gl.useProgram(this.program);

    gl.uniform2fv(this.viewportSizeUniformLoc, [
      (1 / viewportSize.x) * 2,
      (1 / viewportSize.y) * 2,
    ]);

    gl.uniform1i(this.textureLoc, 0);
    gl.activeTexture(gl.TEXTURE0);

    gl.enableVertexAttribArray(this.vertexAttributeLoc);
    gl.enableVertexAttribArray(this.uvAttributeLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);

    for (let textureData of textureBatch.textureData) {
      gl.bindTexture(gl.TEXTURE_2D, textureData.uiTexture.getTextureGL());
      gl.uniform4fv(this.posSizeUniformLoc, textureData.posSize);
      gl.uniform2fv(this.scaleUVUniformLoc, textureData.uvScale);
      gl.uniform2fv(this.offsetUVUniformLoc, textureData.uvOffset);
      gl.uniform1f(this.alphaUniformLoc, textureData.alpha);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      UI_I.numDrawCalls++;
    }

    gl.disableVertexAttribArray(this.vertexAttributeLoc);
    gl.disableVertexAttribArray(this.uvAttributeLoc);
  }
  makeProgram() {
    let vertex =
      "attribute vec2 aVertex;\n" +
      "varying vec2 vUV;\n" +
      "uniform vec2 uViewport;\n" +
      "uniform vec2 uScaleUV;\n" +
      "uniform vec2 uOffsetUV;\n" +
      "uniform vec4 uPosSize;\n" +
      "void main(void){\n" +
      "vec2 pos =aVertex; \n" +
      "pos.xy *=uPosSize.zw; \n" +
      "pos.xy +=uPosSize.xy; \n" +
      "gl_Position =vec4((pos)*uViewport -1.0,0.0,1.0);\n" +
      "gl_Position.y *=-1.0;\n" +
      "vUV =aVertex;\n" +
      "vUV =vUV*uScaleUV+uOffsetUV;\n" +
      "vUV.y =1.0-vUV.y;\n" +
      "}";

    let fragment =
      "precision lowp float;\n" +
      " varying vec2 vUV;\n" +
      " uniform float uAlpha;\n" +
      " uniform  sampler2D texture;\n" +
      " void main(void){\n" +
      " gl_FragColor=texture2D(texture, vUV);\n" +
      " gl_FragColor.a*=uAlpha;\n" +
      " gl_FragColor.xyz*=gl_FragColor.a;\n" +
      " \n" +
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
    this.posSizeUniformLoc = <WebGLUniformLocation>(
      gl.getUniformLocation(this.program, "uPosSize")
    );
    this.scaleUVUniformLoc = <WebGLUniformLocation>(
      gl.getUniformLocation(this.program, "uScaleUV")
    );
    this.offsetUVUniformLoc = <WebGLUniformLocation>(
      gl.getUniformLocation(this.program, "uOffsetUV")
    );
    this.alphaUniformLoc = <WebGLUniformLocation>(
      gl.getUniformLocation(this.program, "uAlpha")
    );
    this.textureLoc = <WebGLUniformLocation>(
      gl.getUniformLocation(this.program, "texture")
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

  private makeBuffers() {
    const gl = this.gl;
    this.vertexBuffer = <WebGLBuffer>gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    const vertices = [0.0, 0.0, 0.0, 1.0, 1.0, 0, 1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  }
}

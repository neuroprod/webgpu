export default class Program {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;

  private vertex: string;
  private fragment: string;

  private defines: string;
  private map: Map<string, WebGLUniformLocation>;

  program: WebGLProgram|null;
  private vertexShader!: WebGLShader;
  private fragmentShader!: WebGLShader;

  vertexAttribute!: GLint;
  uvAttribute0!: GLint;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;

    this.vertex = "";
    this.fragment = "";
    this.program = null;
    this.defines = "";
    this.map = new Map();
  }












  compileProgram() {
    const gl = this.gl;

    this.vertexShader = this.compileShader(this.vertex, gl.VERTEX_SHADER);
    this.fragmentShader = this.compileShader(this.fragment, gl.FRAGMENT_SHADER);

    this.program = <WebGLProgram>gl.createProgram();

    gl.attachShader(this.program, this.vertexShader);
    gl.attachShader(this.program, this.fragmentShader);

    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.log("Could not initialise shaders ");
      console.log(this.vertex);
      console.log(this.fragment);
    }
    gl.useProgram(this.program);

    this.vertexAttribute = gl.getAttribLocation(this.program, "aVertex");
    this.uvAttribute0 = gl.getAttribLocation(this.program, "aUV0");
  }

  compileShader(text:string, type:number): WebGLShader {
    const gl = this.gl;

    let shader = <WebGLShader>gl.createShader(type);

    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log("shader error " + type + " " + gl.getShaderInfoLog(shader));

    }
    return shader;
  }
}

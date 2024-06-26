import FontTexture from "./FontTexture";
import UI_I from "../UI_I";
import Vec2 from "../math/Vec2";
import TextBatchGL from "./TextBatchGL";

export default class TextRenderer {
    public texture: FontTexture;
    private gl: WebGL2RenderingContext | WebGLRenderingContext;
    private vertexShader!: WebGLShader;
    private fragmentShader!: WebGLShader;
    private program!: WebGLProgram;
    private vertexAttributeLoc!: GLint;
    private colorAttributeLoc!: GLint;
    private uvAttributeLoc!: GLint;
    private viewportSizeUniformLoc!: WebGLUniformLocation;
    private textureLoc!: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
        this.gl = gl;
        this.texture = new FontTexture(gl);
        this.makeProgram();
    }

    draw(viewportSize: Vec2, fillBatch: TextBatchGL) {
        if (fillBatch.numIndices == 0) return;

        const gl = this.gl;
        gl.useProgram(this.program);
        gl.uniform2fv(this.viewportSizeUniformLoc, [
            (1 / viewportSize.x) * 2,
            (1 / viewportSize.y) * 2,
        ]);

        gl.uniform1i(this.textureLoc, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);

        gl.enableVertexAttribArray(this.vertexAttributeLoc);
        gl.enableVertexAttribArray(this.uvAttributeLoc);
        gl.enableVertexAttribArray(this.colorAttributeLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, fillBatch.vertexBuffer);
        gl.vertexAttribPointer(this.vertexAttributeLoc, 2, gl.FLOAT, false, 32, 0);
        gl.vertexAttribPointer(this.uvAttributeLoc, 2, gl.FLOAT, false, 32, 8);
        gl.vertexAttribPointer(this.colorAttributeLoc, 4, gl.FLOAT, false, 32, 16);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fillBatch.indexBuffer);

        gl.drawElements(gl.TRIANGLES, fillBatch.numIndices, gl.UNSIGNED_SHORT, 0);
        gl.disableVertexAttribArray(this.vertexAttributeLoc);
        gl.disableVertexAttribArray(this.uvAttributeLoc);
        gl.disableVertexAttribArray(this.colorAttributeLoc);
        UI_I.numDrawCalls++;
    }

    makeProgram() {
        let vertex =
            "attribute vec2 aVertex;\n" +
            "attribute vec2 aUV;\n" +
            "attribute vec4 aColor;\n" +
            "varying vec2 vUV;\n" +
            "varying vec4 vColor;\n" +
            "uniform vec2 uViewport;\n" +
            "void main(void){\n" +
            "gl_Position =vec4((aVertex)*uViewport -1.0,0.0,1.0);\n" +
            "gl_Position.y *=-1.0;\n" +
            "vUV =aUV;\n" +
            "vColor =aColor;\n" +
            "}";

        let fragment =
            "precision lowp float;\n" +
            " varying vec2 vUV;\n" +
            " varying vec4 vColor;\n" +
            " uniform  sampler2D texture;\n" +
            " void main(void){\n" +
            " float l=texture2D(texture, vUV).x;\n" +
            " gl_FragColor.xyz=vColor.xyz*l;\n" +
            " gl_FragColor.w=l*vColor.a;\n" +
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
        this.uvAttributeLoc = gl.getAttribLocation(this.program, "aUV");
        this.colorAttributeLoc = gl.getAttribLocation(this.program, "aColor");
        this.viewportSizeUniformLoc = <WebGLUniformLocation>(
            gl.getUniformLocation(this.program, "uViewport")
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
            console.log(
                "shader error " + type + " " + <string>gl.getShaderInfoLog(shader)
            );
            return null;
        }
        return shader;
    }
}

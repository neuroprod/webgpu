export default class FBO {
    public texture!: WebGLTexture;

    private gl: WebGL2RenderingContext | WebGLRenderingContext;

    private width: number;
    private height: number;

    private fbo!: WebGLFramebuffer;
    private renderbuffer!: WebGLRenderbuffer;
    private _resizeTimeOut!: NodeJS.Timeout;
    private repeat: boolean = false;

    constructor(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        width = 1,
        height = 1,
        repeat: boolean = false
    ) {
        this.gl = gl;
        this.width = width;

        this.height = height;
        this.repeat = repeat;

        this.makeBuffers();
    }

    makeBuffers() {
        let gl = this.gl;
        this.fbo = <WebGLFramebuffer>gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

        this.texture = <WebGLTexture>this.gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.width,
            this.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        if (this.repeat) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }

        gl.bindTexture(gl.TEXTURE_2D, null);

        this.renderbuffer = <WebGLRenderbuffer>gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.renderbufferStorage(
            gl.RENDERBUFFER,
            gl.DEPTH_COMPONENT16,
            this.width,
            this.height
        );
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.texture,
            0
        );
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            this.renderbuffer
        );

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    resize(width: number, height: number) {
        if (this.width == width && this.height == height) return;
        this.width = width;
        this.height = height;

        this.destroy();
        this.makeBuffers();
    }

    delayedResize(width: number, height: number) {
        if (this.width == width && this.height == height) return;
        this.width = width;
        this.height = height;
        clearTimeout(this._resizeTimeOut);
        this._resizeTimeOut = setTimeout(() => {
            this.destroy();
            this.makeBuffers();
        }, 100);
    }

    bind() {
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.viewport(0, 0, this.width, this.height);
    }

    unbind() {
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    destroy() {
        let gl = this.gl;
        gl.deleteRenderbuffer(this.renderbuffer);
        gl.deleteTexture(this.texture);
        gl.deleteFramebuffer(this.fbo);
    }
}

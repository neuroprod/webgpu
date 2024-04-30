import FontTextureData from "../draw/FontTextureData";

export default class FontTexture {
    public texture: WebGLTexture;

    constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
        this.texture = <WebGLTexture>gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.LUMINANCE,
            FontTextureData.width,
            FontTextureData.height,
            0,
            gl.LUMINANCE,
            gl.UNSIGNED_BYTE,
            FontTextureData.getData()
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

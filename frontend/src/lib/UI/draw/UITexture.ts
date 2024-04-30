import Vec2 from "../math/Vec2";

export default class UITexture {
    public textureGL!: WebGLTexture;

    public width: number = 1;
    public height: number = 1;
    public size = new Vec2();

    constructor() {
    }

    setTextureGL(texture: WebGLTexture, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.size.set(width, height);
        this.textureGL = texture;
    }

    getRatio() {
        return this.height / this.width;
    }

    getTextureGL() {
        return this.textureGL;
    }
}

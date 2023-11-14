import UITexture from "./UITexture";
import FBO from "../GL/FBO";
import UI_I from "../UI_I";

export default class UIRenderTexture extends UITexture {
  private fbo: FBO;
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  constructor() {
    super();
    this.gl = UI_I.rendererGL.gl;
    this.fbo = new FBO(UI_I.rendererGL.gl, 1, 1, false);
    this.setTextureGL(this.fbo.texture, 1, 1);
  }
  setSize(w: number, h: number) {
    if (w == this.width && h == this.height) return false;
    if (w < 1 || h < 1) return;
    this.fbo.delayedResize(w, h);
    this.width = w;
    this.height = h;
    this.size.set(w, h);
    return true;
  }
  bind() {
    // this.gl.viewport(0,0,this.width,this.height)
    this.textureGL = this.fbo.texture;
    this.fbo.bind();
  }

  unBind() {
    this.fbo.unbind();
  }
}

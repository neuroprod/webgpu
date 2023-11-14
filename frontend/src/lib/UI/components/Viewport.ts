import Panel, { PanelSettings } from "./Panel";
import UI_IC from "../UI_IC";

import UIRenderTexture from "../draw/UIRenderTexture";
import { TextureSettings } from "./internal/Texture";
import UI_I from "../UI_I";
import Vec2 from "../math/Vec2";
import SelectItem from "../math/SelectItem";
import Local from "../local/Local";
import Utils from "../math/Utils";

export class ViewportSettings extends PanelSettings {
  constructor() {
    super();
    this.box.paddingLeft = 0;
    this.box.paddingRight = 0;
    this.box.paddingBottom = 0;
    this.iconOpen = 11;
    this.iconClose = 12;
  }
}

export default class Viewport extends Panel {
  public renderSize: Vec2 = new Vec2(1, 1);
  private texture: UIRenderTexture;
  private textureSettings: TextureSettings;

  selectItems: Array<SelectItem> = [];
  public currentRatio: Vec2 = new Vec2();

  constructor(id: number, label: string, settings: ViewportSettings) {
    super(id, label, settings);
    this.texture = new UIRenderTexture();
    this.textureSettings = new TextureSettings();
    this.textureSettings.box.marginTop = 22;
    this.textureSettings.setSizeToHeight = false;
    this.renderSize = this.size.clone();

    this.selectItems.push(new SelectItem("fit", new Vec2(-1, -1)));
    this.selectItems.push(new SelectItem("16:9", new Vec2(16, 9)));
    this.selectItems.push(new SelectItem("9:16", new Vec2(9, 16)));
    this.selectItems.push(new SelectItem("Iphone 13 P", new Vec2(1170, 2532)));
    this.selectItems.push(new SelectItem("Iphone 13 L", new Vec2(2532, 1170)));

    this.currentRatio = this.selectItems[0].value.clone();

    this.setFromLocal();
  }
  setFromLocal() {
    let data = Local.getItem(this.id);
    if (data) {
      this.size.set(data.size.x, data.size.y);
      if (data.ratio && this.currentRatio)
        this.currentRatio.set(data.ratio.x, data.ratio.y);

      this.posOffset.set(data.posOffset.x, data.posOffset.y);
      this._collapsed = data.collapsed;
      if (this._collapsed) this.prevSize.y = 300;
    }
  }

  saveToLocal() {
    let a = {
      posOffset: this.posOffset,
      size: this.size,
      collapsed: this.collapsed,
      ratio: this.currentRatio,
    };

    Local.setItem(this.id, a);
  }
  setSubComponents() {
    if (!this.isDockedInPanel) super.setSubComponents();

    if (this.collapsed) return;
    if (UI_IC.settingsButton("LSset")) {
      let pos = this.layoutRect.pos.clone();
      pos.x += this.layoutRect.size.x / 2 - 150;
      pos.y += this.layoutRect.size.y / 2 - 100;
      UI_IC.viewportPopUp(this, pos);
    }
    if (!this.isDocked && !this.collapsed)
      UI_IC.texture("t", this.texture, this.textureSettings);
  }

  setIsDockedInPanel(value: boolean) {
    super.setIsDockedInPanel(value);
    /*  if (value) {
            this.textureSettings.box.marginTop = 0
        } else {
            this.textureSettings.box.marginTop = 20
        }*/
  }

  startRender() {
    if (this.isDocked) return;
    let sX = this.layoutRect.size.x;
    let sY = this.layoutRect.size.y - 22;
    if (this.currentRatio.x != -1) {
      let ratio = this.currentRatio.y / this.currentRatio.x;
      sX = this.layoutRect.size.x;
      sY = this.layoutRect.size.x * ratio;
    }

    this.renderSize.set(sX, sY);
    if (this.texture.setSize(sX, sY)) this.setDirty();
    this.texture.bind();
  }
  prepDraw() {
    if (this._isDockedInPanel) return;

    let settings = this.settings as PanelSettings;

    if (!this.isDocked) {
      UI_I.currentDrawBatch.fillBatch.addShadow(this.layoutRect);
    }
    // Utils.drawOutlineRect(this.layoutRect, settings.outlineColor)

    //UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, settings.backgroundColor);

    //  UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, settings.backgroundColor);
    UI_I.currentDrawBatch.fillBatch.addRect(
      this.topBarRect,
      settings.topBarColor
    );

    if (!this.isDocked && !this.collapsed)
      UI_I.currentDrawBatch.fillBatch.addTriangle(
        this.resizeRect.getTopRight(),
        this.resizeRect.getBottomRight(),
        this.resizeRect.getBottomLeft(),
        settings.resizeColor
      );

    UI_I.currentDrawBatch.textBatch.addLine(
      this.labelPos,
      this.label,
      this.maxLabelSize,
      settings.labelColor
    );
  }
  stopRender() {
    if (this.isDocked) return;
    this.texture.unBind();
    let gl = UI_I.rendererGL.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}

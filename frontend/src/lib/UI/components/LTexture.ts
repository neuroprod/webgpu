import LComponent, { LComponentSettings } from "./LComponent";
import UI_IC from "../UI_IC";
import UITexture from "../draw/UITexture";

export class LTextureSettings extends LComponentSettings {
  constructor() {
    super();
  }
}
export default class LTexture extends LComponent {
  private texture: UITexture;

  constructor(
    id: number,
    label: string,
    texture: UITexture,
    settings: LTextureSettings
  ) {
    super(id, label, settings);
    this.texture = texture;
    this.alwaysPassMouse = true;
  }
  layoutRelative() {
    super.layoutRelative();
    let textureWidth = Math.min(
      this.texture.width,
      this.size.x -
        this.settings.box.paddingLeft -
        this.settings.box.paddingRight
    );
    let textureHeight = Math.max(textureWidth * this.texture.getRatio(), 5);

    this.size.y = textureHeight;
  }
  setSubComponents() {
    super.setSubComponents();
    UI_IC.texture("t", this.texture);
  }
}

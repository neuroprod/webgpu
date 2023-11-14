import Component, { ComponentSettings } from "../Component";
import Color from "../../math/Color";
import UI_I from "../../UI_I";
import Utils from "../../math/Utils";
import Vec2 from "../../math/Vec2";
import Font from "../../draw/Font";

export class SettingsButtonSettings extends ComponentSettings {
  static width = 8;
  constructor() {
    super();
    this.backgroundColor.setHex("#181818", 1);
    this.hasBackground = true;
    this.box.size.set(SettingsButtonSettings.width, 20);
  }
  public colorIconOver: Color = new Color().setHex("#dedede", 1);
  public colorIcon: Color = new Color().setHex("#727272", 1);
}

export default class SettingsButton extends Component {
  private iconPos = new Vec2();

  constructor(id: number, settings: SettingsButtonSettings) {
    super(id, settings);
  }

  layoutRelative() {
    super.layoutRelative();
    let maxWidth = Utils.getMaxInnerWidth(this.parent);
    this.posOffset.x = maxWidth - this.size.x;
  }
  layoutAbsolute() {
    super.layoutAbsolute();
    this.iconPos.copy(this.layoutRect.pos);
    this.iconPos.x += Utils.getCenterPlace(
      Font.iconSize.x,
      this.layoutRect.size.x
    );
    this.iconPos.y += Utils.getCenterPlace(
      Font.iconSize.y,
      this.layoutRect.size.y
    );
  }

  prepDraw() {
    super.prepDraw();
    let settings = this.settings as SettingsButtonSettings;
    let iconColor = settings.colorIcon;
    if (this.isOver) {
      iconColor = settings.colorIconOver;
    }
    UI_I.currentDrawBatch.textBatch.addIcon(this.iconPos, 6, iconColor);
  }
  getReturnValue(): boolean {
    return this.isClicked;
  }
}

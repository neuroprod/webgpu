import Component, { ComponentSettings } from "./Component";

export default class Layer extends Component {
  constructor(
    id: number,
    settings: ComponentSettings = new ComponentSettings()
  ) {
    super(id, settings);
    this.alwaysPassMouse = true;
    this.keepAlive = true;
    this.hasOwnDrawBatch = true;
  }
}

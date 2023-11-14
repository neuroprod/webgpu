import Panel from "../components/Panel";
import Rect from "../math/Rect";

export default class DockTabData {
  public panel!: Panel;
  public rect: Rect = new Rect();
}

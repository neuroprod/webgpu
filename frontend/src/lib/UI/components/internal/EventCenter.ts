import VerticalLayout, {VerticalLayoutSettings} from "../VerticalLayout";
import UI_I from "../../UI_I";

export class EventCenterSettings extends VerticalLayoutSettings {
    constructor() {
        super();
        this.box.size.set(500, 500);
        this.box.marginLeft = 20;

        this.needScrollBar = false;
    }
}

export default class EventCenter extends VerticalLayout {
    constructor(id: number, settings: EventCenterSettings) {
        super(id, settings);
        this.keepAlive = true;
        this.alwaysPassMouse = true;
        this.needsChildrenSortingByRenderOrder = false;
    }

    layoutRelative() {
        super.layoutRelative();
        this.posOffset.y = UI_I.screenSize.y - this.children.length * 36 - 15;
    }
}

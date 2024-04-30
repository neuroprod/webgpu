import Component, {ComponentSettings} from "../Component";
import DockTabData from "../../docking/DockTabData";
import Color from "../../math/Color";
import Vec2 from "../../math/Vec2";
import UI_I from "../../UI_I";

export class DockPanelIndicatorSettings extends ComponentSettings {
    public colorMain: Color = new Color().setHex("#00a8ff", 0.3);
    public colorMainOver: Color = new Color().setHex("#00a8ff", 0.6);

    constructor() {
        super();
    }
}

export default class DockPanelIndicator extends Component {
    private item: DockTabData;
    private isOverDrag: Boolean = false;

    constructor(
        id: number,
        item: DockTabData,
        settings: DockPanelIndicatorSettings
    ) {
        super(id, settings);
        this.item = item;
        this.posOffset.copy(this.item.rect.pos);
        this.size.copy(this.item.rect.size);
        this.settings.box.size.copy(this.size);
    }

    checkMouseOverLayout(pos: Vec2) {
        let isOver = this.layoutRect.contains(pos);
        if (UI_I.mouseListener.isUpThisFrame && this.isOverDrag) {
            UI_I.dockManager.dockInPanel(this.item.panel);
        }
        if (isOver && !this.isOverDrag) {
            this.isOverDrag = true;
            this.setDirty();
        } else if (!isOver && this.isOverDrag) {
            this.isOverDrag = false;
            this.setDirty();
        }
        return isOver;
    }

    prepDrawInt() {
        let settings = this.settings as DockPanelIndicatorSettings;
        if (this.isOverDrag) {
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.layoutRect,
                settings.colorMainOver
            );
        } else {
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.layoutRect,
                settings.colorMain
            );
        }
    }
}

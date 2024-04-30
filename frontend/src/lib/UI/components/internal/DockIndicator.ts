import Component, {ComponentSettings} from "../Component";
import Color from "../../math/Color";

import Vec2 from "../../math/Vec2";
import UI_I from "../../UI_I";
import Rect from "../../math/Rect";
import {DockType} from "../../docking/DockType";
import DockNode from "../../docking/DockNode";

export class DockIndicatorSettings extends ComponentSettings {
    public colorMain: Color = new Color().setHex("#00a8ff", 0.5);
    public colorMainOver: Color = new Color().setHex("#00a8ff", 0.6);
    public colorDock: Color = new Color().setHex("#02557d", 0.7);
    public colorDockOver: Color = new Color().setHex("#022839", 0.8);
    public type: DockType;
    public dock: DockNode;

    constructor(type: DockType, dock: DockNode) {
        super();
        this.type = type;
        this.dock = dock;
    }
}

export default class DockIndicator extends Component {
    public isOverDrag: boolean = false;
    private localSettings: DockIndicatorSettings;
    private dockRect!: Rect;

    constructor(id: number, settings: DockIndicatorSettings) {
        super(id, settings);

        this.localSettings = settings;
    }

    layoutRelative() {
    }

    checkMouseOverLayout(pos: Vec2) {
        let isOver = this.layoutRect.contains(pos);
        if (UI_I.mouseListener.isUpThisFrame && this.isOverDrag) {
            UI_I.dockManager.split(this.localSettings.type, this.localSettings.dock);
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

    layoutAbsolute() {
        let s = this.localSettings.dock.size;
        let p = this.localSettings.dock.pos;
        let sizeW = 40;
        let sizeS = 40;
        let offset = 15;
        let sizeWD = 40 - 4;
        let sizeSD = 15;
        let offsetW = (sizeW - sizeWD) / 2;
        let offsetS = offsetW;
        let centerOff = 10;
        this.layoutRect = new Rect(
            new Vec2(s.x / 2 - sizeW / 2, s.y - offset - sizeS),
            new Vec2(sizeW, sizeS)
        );
        this.dockRect = new Rect(
            new Vec2(s.x / 2 - sizeW / 2 + offsetW, s.y - offset - offsetS - sizeSD),
            new Vec2(sizeWD, sizeSD)
        );

        if (this.localSettings.type == DockType.Right) {
            this.layoutRect = new Rect(
                new Vec2(offset, s.y / 2 - sizeW / 2),
                new Vec2(sizeS, sizeW)
            );
            this.dockRect = new Rect(
                new Vec2(offset + offsetS, s.y / 2 - sizeW / 2 + offsetW),
                new Vec2(sizeSD, sizeWD)
            );
        } else if (this.localSettings.type == DockType.Left) {
            this.layoutRect = new Rect(
                new Vec2(s.x - offset - sizeS, s.y / 2 - sizeW / 2),
                new Vec2(sizeS, sizeW)
            );
            this.dockRect = new Rect(
                new Vec2(
                    s.x - offset - sizeSD - offsetS,
                    s.y / 2 - sizeW / 2 + offsetW
                ),
                new Vec2(sizeSD, sizeWD)
            );
        } else if (this.localSettings.type == DockType.Top) {
            this.layoutRect = new Rect(
                new Vec2(s.x / 2 - sizeW / 2, offset),
                new Vec2(sizeW, sizeS)
            );
            this.dockRect = new Rect(
                new Vec2(s.x / 2 - sizeW / 2 + offsetW, offset + offsetS),
                new Vec2(sizeWD, sizeSD)
            );
        } else if (this.localSettings.type == DockType.Bottom) {
            this.layoutRect = new Rect(
                new Vec2(s.x / 2 - sizeW / 2, s.y - offset - sizeS),
                new Vec2(sizeW, sizeS)
            );
            this.dockRect = new Rect(
                new Vec2(
                    s.x / 2 - sizeW / 2 + offsetW,
                    s.y - offset - offsetS - sizeSD
                ),
                new Vec2(sizeWD, sizeSD)
            );
        } else if (this.localSettings.type == DockType.Center) {
            this.layoutRect = new Rect(
                new Vec2(s.x / 2 - sizeS / 2, s.y / 2 - sizeS / 2),
                new Vec2(sizeS, sizeS)
            );
            this.dockRect = new Rect(
                new Vec2(s.x / 2 - sizeS / 2 + offsetS, s.y / 2 - sizeS / 2 + offsetS),
                new Vec2(sizeS - offsetS * 2, sizeS - offsetS * 2)
            );
        } else if (this.localSettings.type == DockType.LeftCenter) {
            this.layoutRect = new Rect(
                new Vec2(s.x / 2 - sizeS / 2 - sizeS - centerOff, s.y / 2 - sizeS / 2),
                new Vec2(sizeS, sizeS)
            );
            this.dockRect = new Rect(
                new Vec2(
                    s.x / 2 - sizeS / 2 - sizeS - centerOff + offsetS,
                    s.y / 2 - sizeS / 2 + offsetS
                ),
                new Vec2(sizeSD, sizeS - offsetS * 2)
            );
        } else if (this.localSettings.type == DockType.RightCenter) {
            this.layoutRect = new Rect(
                new Vec2(s.x / 2 + sizeS / 2 + centerOff, s.y / 2 - sizeS / 2),
                new Vec2(sizeS, sizeS)
            );
            this.dockRect = new Rect(
                new Vec2(
                    s.x / 2 + sizeS / 2 + centerOff + sizeS - sizeSD - offsetS,
                    s.y / 2 - sizeS / 2 + offsetS
                ),
                new Vec2(sizeSD, sizeS - offsetS * 2)
            );
        } else if (this.localSettings.type == DockType.TopCenter) {
            this.layoutRect = new Rect(
                new Vec2(s.x / 2 - sizeS / 2, s.y / 2 - sizeS / 2 - sizeS - centerOff),
                new Vec2(sizeS, sizeS)
            );
            this.dockRect = new Rect(
                new Vec2(
                    s.x / 2 - sizeS / 2 + offsetS,
                    s.y / 2 - sizeS / 2 - sizeS - centerOff + offsetS
                ),
                new Vec2(sizeS - offsetS * 2, sizeSD)
            );
        } else if (this.localSettings.type == DockType.BottomCenter) {
            this.layoutRect = new Rect(
                new Vec2(s.x / 2 - sizeS / 2, s.y / 2 + sizeS / 2 + centerOff),
                new Vec2(sizeS, sizeS)
            );
            this.dockRect = new Rect(
                new Vec2(
                    s.x / 2 - sizeS / 2 + offsetS,
                    s.y / 2 + sizeS / 2 + centerOff + sizeS - sizeSD - offsetS
                ),
                new Vec2(sizeS - offsetS * 2, sizeSD)
            );
        }
        this.layoutRect.pos.add(p);
        this.layoutRect.setMinMax();
        this.dockRect.pos.add(p);
        this.dockRect.setMinMax();
    }

    prepDrawInt() {
        if (this.isOverDrag) {
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.layoutRect,
                this.localSettings.colorMainOver
            );
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.dockRect,
                this.localSettings.colorDockOver
            );
        } else {
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.layoutRect,
                this.localSettings.colorMain
            );
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.dockRect,
                this.localSettings.colorDock
            );
        }
    }
}

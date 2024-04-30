import Component, {ComponentSettings} from "./Component";
import Vec2 from "../math/Vec2";
import UI_I from "../UI_I";
import Rect from "../math/Rect";
import Color from "../math/Color";

import Font from "../draw/Font";
import Local from "../local/Local";
import Utils from "../math/Utils";
import UI_IC from "../UI_IC";
import Box from "../math/Box";

export class PanelSettings extends ComponentSettings {
    public static gPosition: Vec2 = new Vec2(10, 10);

    public position!: Vec2;

    public backgroundColor: Color = new Color().setHex("#403f3e", 1);

    public labelColor: Color = new Color().setHex("#d8d8d8", 1);
    public topBarColor: Color = new Color().setHex("#2b2927", 1);
    public resizeColor: Color = new Color().setHex("#1c1c1c", 1);
    public outlineColor: Color = new Color().setHex("#575757", 1);
    public topBarHeight = 22;
    public minSize = new Vec2(156, 100);
    public iconOpen = 1;
    public iconClose = 2;

    constructor() {
        super();
        //this.position.add (PanelSettings.positionOffset)
        this.box.setPadding(3);
        this.box.paddingTop = 0;
        this.box.size.set(320, 300);
    }
}

export default class Panel extends Component {
    public label: string;
    public isDragging = false;
    public isResizing = false;
    public startDragPos = new Vec2();
    public startResizeSize = new Vec2();
    public topBarRect: Rect = new Rect();
    public labelPos: Vec2 = new Vec2();
    public resizeRect: Rect;
    public maxLabelSize!: number;

    private tryDrag = false;
    private tryDragMouse = new Vec2();
    private dockSize: Vec2 = new Vec2();
    protected prevSize: Vec2 = new Vec2();
    protected _isDockedInPanel: boolean = false;
    private saveBox!: Box;

    constructor(id: number, label: string, settings: PanelSettings) {
        super(id, settings);
        if (!settings.position) {
            this.posOffset = PanelSettings.gPosition.clone();
            PanelSettings.gPosition.x += 30;
            PanelSettings.gPosition.y += 25;
        } else {
            this.posOffset = settings.position.clone();
        }

        // this.size.copy(settings.size)

        this.hasOwnDrawBatch = true;
        this.label = label;

        this.resizeRect = new Rect();
        this.resizeRect.setSize(12, 12);

        this.setFromLocal();
    }

    protected _collapsed = false;

    get collapsed(): boolean {
        return this._collapsed;
    }

    set collapsed(value: boolean) {
        if (value == this._collapsed) return;
        this._collapsed = value;
        if (this._collapsed) {
            this.prevSize.copy(this.size);
            this.size.y = 22;
        } else {
            if (this.prevSize.y < 50) this.prevSize.y = 300;
            this.size.y = this.prevSize.y;
        }
        this.saveToLocal();
        this.setDirty();
    }

    get isDockedInPanel(): boolean {
        return this._isDockedInPanel;
    }

    public setIsDockedInPanel(value: boolean) {
        this._isDockedInPanel = value;
        if (this._isDockedInPanel) {
            if (this._collapsed) this.collapsed = false;
            this.saveBox = this.settings.box;
            this.settings.box = new Box();
            this.settings.box.size.set(-1, -1);
            this.settings.box.marginTop = 25;

            this.posOffset.set(0, 0);
            this.setDirty();
        } else {
            this.settings.box = this.saveBox;
            this.setDirty();
        }
    }

    private _isDocked: boolean = false;

    get isDocked(): boolean {
        return this._isDocked;
    }

    set isDocked(value: boolean) {
        if (this._isDocked && !value) {
            this.posOffset.copy(UI_I.mouseListener.mousePos);
            this.posOffset.x -= this.dockSize.x / 2;
            this.posOffset.y -= 10;
            let settings = this.settings as PanelSettings;
            this.size.copy(settings.box.size);
        }
        if (value) {
            if (this._collapsed) this.collapsed = false;
            this.tryDrag = false;
            this.isDragging = false;
            this.isResizing = false;
            UI_I.panelDockingLayer.addChild(this);

            this.setDirty(true);
        }

        this._isDocked = value;
    }

    setSubComponents() {
        if (!this.isDocked) {
            let settings = this.settings as PanelSettings;
            if (
                UI_IC.toggleIcon(
                    "ib",
                    this,
                    "collapsed",
                    settings.iconClose,
                    settings.iconOpen
                )
            ) {
            }
        }
    }

    setFromLocal() {
        let data = Local.getItem(this.id);
        if (data) {
            this.size.set(data.size.x, data.size.y);

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
        };

        Local.setItem(this.id, a);
    }

    onMouseDown() {
        if (this.topBarRect.contains(UI_I.mouseListener.mousePos)) {
            this.tryDrag = true;
            this.tryDragMouse.copy(UI_I.mouseListener.mousePos);
            this.startDragPos.copy(this.posOffset);
            this.isDragging = false;
            this.isResizing = false;
            return;
        } else if (
            !this.isDocked &&
            this.resizeRect.contains(UI_I.mouseListener.mousePos)
        ) {
            this.isResizing = true;
            this.startResizeSize = this.size.clone();
        }
    }

    onMouseUp() {
        //when hit docking layer, this doesnt reach, set isDocked and setDockInPanel

        if (this.isDragging || this.isResizing) {
            this.saveToLocal();
        }
        if (this.isDragging) {
            UI_I.panelLayer.addChild(this);
            UI_I.dockManager.stopDragging(this);
        }
        this.tryDrag = false;
        this.isDragging = false;
        this.isResizing = false;
    }

    setDockInPanel(panel: Panel) {
        this.tryDrag = false;
        this.isDragging = false;
        this.isResizing = false;
    }

    updateOnMouseDown() {
        if (this.tryDrag) {
            let dist = UI_I.mouseListener.mousePos.distance(this.tryDragMouse);
            if (dist < 2) return;

            this.tryDrag = false;
            this.isDragging = true;
            this.isDocked = false;

            UI_I.panelDragLayer.addChild(this);
            UI_I.dockManager.startDragging(this);
        }
        if (this.isDragging) {
            let dir = UI_I.mouseListener.mousePosDown.clone();
            dir.sub(UI_I.mouseListener.mousePos);
            let newPos = this.startDragPos.clone();
            newPos.sub(dir);
            this.posOffset.copy(newPos);

            this.setDirty(true);
        }
        if (this.isResizing) {
            let dir = UI_I.mouseListener.mousePosDown.clone();
            dir.sub(UI_I.mouseListener.mousePos);
            let newSize = this.startResizeSize.clone();
            newSize.sub(dir);
            let settings = this.settings as PanelSettings;
            newSize.max(settings.minSize);

            this.size.copy(newSize);
            this.setDirty(true);
        }

        if (this.isDragging || this.isResizing) {
            this.setDirty();
        }
    }

    layoutAbsolute() {
        super.layoutAbsolute();

        let settings = this.settings as PanelSettings;
        this.topBarRect.copyPos(this.layoutRect.pos);
        this.topBarRect.setSize(this.layoutRect.size.x, settings.topBarHeight);

        this.labelPos.set(
            this.posAbsolute.x + settings.box.paddingLeft + 5 + 20,
            this.posAbsolute.y + settings.topBarHeight / 2 - Font.charSize.y / 2 - 1
        );
        if (this.isDocked) {
            this.labelPos.x -= 20;
        }

        this.resizeRect.setPos(
            this.layoutRect.pos.x + this.layoutRect.size.x - this.resizeRect.size.x,
            this.layoutRect.pos.y + this.layoutRect.size.y - this.resizeRect.size.y
        );
        this.maxLabelSize =
            this.layoutRect.size.x -
            settings.box.paddingLeft -
            settings.box.paddingRight;
    }

    prepDraw() {
        if (this._isDockedInPanel) return;

        let settings = this.settings as PanelSettings;

        if (!this.isDocked) {
            UI_I.currentDrawBatch.fillBatch.addShadow(this.layoutRect);
        }
        Utils.drawOutlineRect(this.layoutRect, settings.outlineColor);

        UI_I.currentDrawBatch.fillBatch.addRect(
            this.layoutRect,
            settings.backgroundColor
        );

        UI_I.currentDrawBatch.fillBatch.addRect(
            this.layoutRect,
            settings.backgroundColor
        );
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
}

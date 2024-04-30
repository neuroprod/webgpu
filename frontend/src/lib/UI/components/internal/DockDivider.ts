import Component, {ComponentSettings} from "../Component";
import UI_I from "../../UI_I";
import Color from "../../math/Color";
import Vec2 from "../../math/Vec2";
import DockNode from "../../docking/DockNode";
import {DockSplit} from "../../docking/DockType";
import Rect from "../../math/Rect";

export class DockDividerSettings extends ComponentSettings {
    public splitType: DockSplit;
    public color: Color = new Color().setHex("#868686", 1);
    public colorOver: Color = new Color().setHex("#d7d7d7", 1);
    public wideSize = 50;
    public smallSize = 7;

    constructor(type: DockSplit) {
        super();
        this.splitType = type;
    }
}

export default class DockDivider extends Component {
    private isDragging: boolean = false;
    private startDragPos!: Vec2;

    private posMin: Vec2 = new Vec2();
    private posMax: Vec2 = new Vec2();
    private docNode!: DockNode;
    private center: Vec2 = new Vec2();

    private drawRect = new Rect();

    constructor(id: number, settings: DockDividerSettings) {
        super(id, settings);

        if (settings.splitType == DockSplit.Horizontal) {
            this.size.set(settings.wideSize, settings.smallSize);
        } else {
            this.size.set(settings.smallSize, settings.wideSize);
        }
        settings.box.size.copy(this.size);
        this.posOffset.set(0, 0);
    }

    onMouseDown() {
        super.onMouseDown();
        this.isDragging = true;

        this.startDragPos = this.center.clone();
    }

    updateOnMouseDown() {
        if (this.isDragging) {
            let dir = UI_I.mouseListener.mousePosDown.clone();
            dir.sub(UI_I.mouseListener.mousePos);
            let newPos = this.startDragPos.clone();
            newPos.sub(dir);
            newPos.clamp(this.posMin, this.posMax);
            this.docNode.setDividerPos(newPos);

            this.center.copy(newPos);

            this.setDirty(true);
        }
    }

    onMouseUp() {
        super.onMouseUp();
        this.isDragging = false;
    }

    place(node: DockNode, dividerPos: Vec2, min: Vec2, max: Vec2) {
        if (
            dividerPos.equal(this.center) &&
            min.equal(this.posMin) &&
            max.equal(this.posMax)
        )
            return;
        this.docNode = node;
        this.center.copy(dividerPos);
        this.posMin.copy(min);
        this.posMax.copy(max);
        this.setDirty();
    }

    layoutRelative() {
        this.posOffset.copy(this.center);
        this.posOffset.sub(this.size.clone().scale(0.5));
    }

    layoutAbsolute() {
        super.layoutAbsolute();
        this.drawRect.copy(this.layoutRect);
        this.drawRect.size.x -= 5;
        this.drawRect.size.y -= 5;
        this.drawRect.pos.x += 2.5;
        this.drawRect.pos.y += 2.5;
    }

    prepDrawInt() {
        let settings = this.settings as DockDividerSettings;
        if (this.isOver || this.isFocus) {
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.drawRect,
                settings.colorOver
            );
        } else {
            UI_I.currentDrawBatch.fillBatch.addRect(this.drawRect, settings.color);
        }
    }
}

import Component, {ComponentSettings} from "../Component";
import Color from "../../math/Color";
import UI_I from "../../UI_I";
import Utils from "../../math/Utils";
import Vec2 from "../../math/Vec2";
import Font from "../../draw/Font";
import {ActionKey} from "../../input/KeyboardListener";
import Rect from "../../math/Rect";

export class InputBaseSettings extends ComponentSettings {
    public colorBack: Color = new Color().setHex("#2d2d2d", 1);
    public colorOutline: Color = new Color().setHex("#8b826d", 0.2);
    public colorText: Color = new Color().setHex("#cbcbcb", 1);
    public colorBackFocus: Color = new Color().setHex("#1a1a1a", 1);
    public colorOutlineFocus: Color = new Color().setHex("#ff6363", 0.5);
    public colorTextFocus: Color = new Color().setHex("#FFFFFF", 1);
    public colorCursor: Color = new Color().setHex("#c7c7c7", 1);
    public autoFocus = false;

    constructor() {
        super();
    }

    static floatFilter = (val: string) => {
        val = val.replace(/[^\d.-]/g, "");
        return val;
    };

    public filter: (val: string) => string = (val: string) => {
        return val;
    };
}

export default class InputBase extends Component {
    private text: string;
    private textPos: Vec2 = new Vec2();
    private cursorDrawPos: Vec2 = new Vec2();
    private textMaxSize: number = 0;
    private charWidth: number;
    private cursorPos: number = 0;
    private isDragging: boolean = false;
    private dragPos: number = 0;
    private isSelecting: boolean = false;
    private selectRect: Rect = new Rect();
    private _textIsDirty: boolean = false;
    private ref: any;
    private prop: string;
    private filter: (val: string) => string;
    private prevFocusComponent: Component | null = null;

    constructor(id: number, ref: any, prop: string, settings: InputBaseSettings) {
        super(id, settings);
        this.filter = settings.filter;
        this.ref = ref;
        this.prop = prop;
        this.size.copy(settings.box.size);
        this.text = this.filter(ref[prop]);
        this.charWidth = Font.charSize.x;
        this.cursorPos = this.text.length;
        if (settings.autoFocus) {
            this.prevFocusComponent = UI_I.focusComponent;
            UI_I.setFocusComponent(this);

            this.cursorPos = this.text.length;
            this.dragPos = 0;
            this.isSelecting = true;
        }
    }

    onAdded() {
        if (this.text != this.ref[this.prop]) {
            this.text = this.ref[this.prop];
            this.setDirty();
        }
    }

    getMouseCursorPos() {
        let pos = UI_I.mouseListener.mousePos.x - this.textPos.x;
        pos = Math.round(pos / this.charWidth);
        pos = this.limitMouseCursor(pos);
        return pos;
    }

    limitMouseCursor(pos: number) {
        if (pos < 0) pos = 0;
        if (pos > this.text.length) pos = this.text.length;
        return pos;
    }

    setKeys(buffer: string, actionKey: ActionKey) {
        if (actionKey == ActionKey.Enter) {
            UI_I.setFocusComponent(this.prevFocusComponent);
        }
        if (actionKey == ActionKey.Copy) {
            if (this.isSelecting) {
                let lPos = this.cursorPos;
                let rPos = this.dragPos;
                if (this.dragPos < this.cursorPos) {
                    rPos = this.cursorPos;
                    lPos = this.dragPos;
                }
                let copyText = this.text.slice(lPos, rPos);
                navigator.clipboard.writeText(copyText).then(
                    function () {
                    },
                    function (err) {
                        console.error("Async: Could not copy text: ", err);
                    }
                );
            }
        }

        if (actionKey == ActionKey.ArrowRight) {
            this.cursorPos = this.limitMouseCursor(this.cursorPos + 1);
            this.setDirty();
        }
        if (actionKey == ActionKey.ArrowLeft) {
            this.cursorPos = this.limitMouseCursor(this.cursorPos - 1);
            this.setDirty();
        }
        if (actionKey == ActionKey.BackSpace) {
            if (this.isSelecting) {
                this.removeSelection();
            } else {
                this.text =
                    this.text.slice(0, this.cursorPos - 1) +
                    this.text.slice(this.cursorPos);
                this.cursorPos = this.limitMouseCursor(this.cursorPos - 1);
            }

            this.setTextDirty();
            this.setDirty();
        }

        if (buffer.length) {
            if (this.isSelecting) {
                this.removeSelection();
            }

            this.text = [
                this.text.slice(0, this.cursorPos),
                buffer,
                this.text.slice(this.cursorPos),
            ].join("");
            this.text = this.filter(this.text);
            this.cursorPos = this.limitMouseCursor(this.cursorPos + buffer.length);
            this.setDirty();
            this.setTextDirty();
        }
    }

    setTextDirty() {
        this.ref[this.prop] = this.text;
        this._textIsDirty = true;
    }

    removeSelection() {
        let lPos = this.cursorPos;
        let rPos = this.dragPos;
        if (this.dragPos < this.cursorPos) {
            rPos = this.cursorPos;
            lPos = this.dragPos;
        }
        this.text = [this.text.slice(0, lPos), this.text.slice(rPos)].join("");
        this.cursorPos = lPos;
        this.isSelecting = false;
    }

    onMouseDown() {
        if (this.isFocus) {
            this.cursorPos = this.getMouseCursorPos();
            this.isDragging = true;
        } else {
            this.dragPos = 0;
            this.isSelecting = true;
            this.cursorPos = this.text.length;
            this.setDirty();
        }
    }

    onMouseUp() {
        this.isDragging = false;
    }

    updateOnMouseDown() {
        if (this.isDragging) {
            this.dragPos = this.getMouseCursorPos();
            if (this.dragPos != this.cursorPos) {
                this.isSelecting = true;
                this.setDirty();
            } else if (this.isSelecting) {
                this.isSelecting = false;
                this.setDirty();
            }
        }
    }

    layoutRelative() {
        super.layoutRelative();
        let settings = this.settings as InputBaseSettings;
        if (settings.box.size.x == -1)
            this.size.x =
                Utils.getMaxInnerWidth(this.parent) -
                settings.box.marginLeft -
                settings.box.marginRight;
        if (settings.box.size.y == -1)
            this.size.y =
                Utils.getMaxInnerHeight(this.parent) -
                settings.box.marginTop -
                settings.box.marginRight;
    }

    layoutAbsolute() {
        super.layoutAbsolute();

        this.textPos = this.layoutRect.pos.clone();
        this.textPos.copy(this.layoutRect.pos);
        this.textPos.x += 5;
        this.textPos.y += Utils.getCenterPlace(
            Font.charSize.y,
            this.layoutRect.size.y
        );
        this.textMaxSize = this.layoutRect.size.x - 10;

        this.cursorDrawPos.copy(this.textPos);
        this.cursorDrawPos.y -= 3;
        this.cursorDrawPos.x += this.cursorPos * this.charWidth;
        if (this.isSelecting) {
            let lPos = this.cursorPos;
            let rPos = this.dragPos;
            if (this.dragPos < this.cursorPos) {
                rPos = this.cursorPos;
                lPos = this.dragPos;
            }
            this.selectRect.pos.copy(this.textPos);
            this.selectRect.pos.y -= 4;
            this.selectRect.pos.x += lPos * this.charWidth;
            this.selectRect.size.set((rPos - lPos) * this.charWidth, 18);
        }
    }

    prepDraw() {
        if (this.layoutRect.size.x < 0) return;
        super.prepDraw();

        let settings = this.settings as InputBaseSettings;

        let colorBack = settings.colorBack;
        let colorOutline = settings.colorOutline;
        let colorText = settings.colorText;

        if (this.isFocus) {
            colorBack = settings.colorBackFocus;
            colorOutline = settings.colorOutlineFocus;
            colorText = settings.colorTextFocus;

            if (!this.isSelecting) {
                UI_I.currentDrawBatch.textBatch.addIcon(
                    this.cursorDrawPos,
                    7,
                    settings.colorCursor
                );
            }
        }

        UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, colorOutline);
        Utils.drawInLineRect(this.layoutRect, colorBack);
        UI_I.currentDrawBatch.textBatch.addLine(
            this.textPos,
            this.text,
            this.textMaxSize,
            colorText
        );
        if (this.isSelecting && this.isFocus) {
            UI_I.currentDrawBatch.fillBatch.addRect(this.selectRect, colorOutline);
        }
    }

    getReturnValue() {
        let r = this._textIsDirty;
        this._textIsDirty = false;
        return r;
    }
}

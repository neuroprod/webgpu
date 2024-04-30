import Component, {ComponentSettings} from "./Component";
import UI_I from "../UI_I";
import Rect from "../math/Rect";
import Color from "../math/Color";
import Utils from "../math/Utils";

export class VerticalLayoutSettings extends ComponentSettings {
    scrollBarWidth = 3;
    scrollbarMargin = 3;
    scrollBarColor = new Color().setHex("#525252", 1);
    scrollBarOverColor = new Color().setHex("#6c6c6c", 1);
    hasOwnDrawBatch = true;
    needScrollBar = true;

    constructor() {
        super();
        /*this.hasBackground =true;
    this.backgroundColor.r =Math.random()
            this.backgroundColor.g =Math.random()
            this.backgroundColor.b =Math.random()*/
    }
}

export default class VerticalLayout extends Component {
    private childrenHeight: number = 0;
    private scrollBarRect: Rect = new Rect();
    /*private isDraggingScroll: boolean;
      private downPosY: number;
      private scrollBarOffset =0;
      private scrollBarStartY =0;
      private scrollBarY =0;*/
    public needScrollBar = true;

    constructor(id: number, settings: VerticalLayoutSettings) {
        super(id, settings);
        this.needsChildrenSortingByRenderOrder = true;
        this.hasOwnDrawBatch = settings.hasOwnDrawBatch;
        this.needScrollBar = settings.needScrollBar;
    }

    updateCursor(comp: Component) {
        this.placeCursor.y +=
            +comp.settings.box.marginTop +
            comp.size.y +
            comp.settings.box.marginBottom;
    }

    needsResize(): boolean {
        if (this.size.y < this.placeCursor.y) {
            // @ts-ignore
            this.size.y =
                Math.min(this.placeCursor.y, Utils.getMaxInnerHeight(this.parent)) -
                this.settings.box.marginBottom -
                this.settings.box.marginTop;
        }
        //this.hasOwnDrawBatch =false;
        if (this.size.y < this.placeCursor.y) {
            if (this.needScrollBar) {
                //this.hasOwnDrawBatch =true;

                this.hasScrollBar = true;
                this.childrenHeight = this.placeCursor.y;
                let settings = this.settings as VerticalLayoutSettings;
                this.settings.box.paddingRight =
                    settings.scrollBarWidth + settings.scrollbarMargin;

                //console.log(this.clippingRect,this.layoutRect)
            } else {
                this.size.y = this.placeCursor.y;
                // this.hasOwnDrawBatch =false;
            }

            return true;
        }
        if (this.size.y > this.placeCursor.y) {
            this.size.y = this.placeCursor.y;
        }

        this.scrollOffset.y = 0;
        this.hasScrollBar = false;

        return false;
    }

    updateMouse() {
        /* if(!this.hasScrollBar)return;


            if (this.isDown) {
                if (this.isDownThisFrame) {
                    if (this.scrollBarRect.contains(UI_I.mouseListener.mousePos)) {
                        this.isDraggingScroll = true;
                        this.downPosY =UI_I.mouseListener.mousePos.y
                    }
                }
            } else if(  this.isDraggingScroll) {
                this.isDraggingScroll = false;
                this.scrollBarStartY+=this.scrollBarOffset;
                this.scrollBarOffset =0

            }*/
    }

    onMouseDown() {
        /*   if(!this.hasScrollBar)return;
            if (this.scrollBarRect.contains(UI_I.mouseListener.mousePos)) {
                this.isDraggingScroll = true;
                this.downPosY =UI_I.mouseListener.mousePos.y
            }*/
    }

    onMouseUp() {
        /* this.isDraggingScroll = false;
            this.scrollBarStartY+=this.scrollBarOffset;
            this.scrollBarOffset =0
    */
    }

    updateOnMouseDown() {
        /*   if (this.isDraggingScroll) {


                this.scrollBarOffset = UI_I.mouseListener.mousePos.y-this.downPosY;
                this.scrollBarY =this.scrollBarStartY+this.scrollBarOffset
                this.scrollBarY =Math.max(0,this.scrollBarY)

                let scrollRange =this.layoutRect.size.y-this.scrollBarRect.size.y;
                this.scrollBarY =Math.min(scrollRange,this.scrollBarY)
                let scrollRel =this.scrollBarY/scrollRange;


                this.scrollOffset.y =-scrollRel*( this.childrenHeight-this.layoutRect.size.y);

                this.setDirty(true);
            }*/
    }

    public setScrollDelta(delta: number) {
        this.scrollOffset.y -= delta;
        if (this.scrollOffset.y > 0) this.scrollOffset.y = 0;
        let maxHeight = this.childrenHeight - this.layoutRect.size.y;
        if (this.scrollOffset.y < -maxHeight) this.scrollOffset.y = -maxHeight;
        this.setDirty(true);
    }

    layoutRelative() {
        this.settings.box.paddingRight = 0; //reset box padding
        /*   let maxWidth =Utils.getMaxInnerWidth(this.parent) -this.settings.box.marginLeft-this.settings.box.marginRight;
         */ //let maxHeight = Utils.getMaxInnerHeight(this.parent)-this.settings.box.marginTop-this.settings.box.marginBottom;

        //this.size.x = maxWidth;
        //this.size.y = maxHeight;
    }

    layoutAbsolute() {
        super.layoutAbsolute();
        if (!this.hasScrollBar) return;

        let settings = this.settings as VerticalLayoutSettings;
        this.scrollBarRect.copyPos(this.layoutRect.pos);

        this.scrollBarRect.pos.y -=
            (this.scrollOffset.y / this.childrenHeight) * this.layoutRect.size.y;
        this.scrollBarRect.pos.x +=
            this.layoutRect.size.x - settings.scrollBarWidth;

        let sbh =
            (this.layoutRect.size.y / this.childrenHeight) * this.layoutRect.size.y;

        this.scrollBarRect.setSize(settings.scrollBarWidth, sbh);
    }

    prepDraw() {
        super.prepDraw();

        if (!this.hasScrollBar) return;
        UI_I.currentDrawBatch.needsClipping = true;
        let settings = this.settings as VerticalLayoutSettings;
        if (this.isOverChild) {
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.scrollBarRect,
                settings.scrollBarOverColor
            );
        } else {
            UI_I.currentDrawBatch.fillBatch.addRect(
                this.scrollBarRect,
                settings.scrollBarColor
            );
        }
    }
}

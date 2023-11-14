import Box from "../math/Box";
import Rect from "../math/Rect";
import UI_I from "../UI_I";
import Vec2 from "../math/Vec2";
import Color from "../math/Color";

import { ActionKey } from "../input/KeyboardListener";
import { HAlign } from "../UI_Enums";
import Utils from "../math/Utils";
import DrawBatch from "../draw/DrawBatch";

export class ComponentSettings {
  public box: Box = new Box();
  public hasBackground = false;
  public backgroundColor = new Color(1, 0, 0, 1);

  public hasOwnDrawBatch = false;
}

export default class Component {
  public id: number;
  public settings: ComponentSettings;
  public parent: Component | null = null;
  public children: Array<Component> = [];

  public placeCursor = new Vec2();
  public posRelative = new Vec2();
  public posAbsolute = new Vec2();
  public layoutRect = new Rect();

  public posOffset = new Vec2();
  public posOffsetRelative = new Vec2();

  public keepAlive = false;
  public isDirty = true;
  public useThisFrame: boolean = true;
  public hasOwnDrawBatch: boolean = false;

  public size = new Vec2();
  public alwaysPassMouse = false;
  public isFocus = false;
  public isOver = false;
  public isOverChild: boolean = false;
  public isDown = false;
  public isDownThisFrame = false;
  public isClicked: boolean = false;

  public renderOrderCount: number = 0;
  public renderOrder: number = 0;
  public needsChildrenSortingByRenderOrder = false;
  public sortIsDirty = false;
  public scrollOffset: Vec2 = new Vec2();

  public clippingRect = new Rect();
  protected hasScrollBar: boolean = false;
  private idStack: Array<number> = [];

  constructor(id: number, settings: ComponentSettings) {
    this.id = id;
    this.idStack.push(id);
    this.settings = settings;
    this.size.copy(this.settings.box.size);
    this.hasOwnDrawBatch = settings.hasOwnDrawBatch;
  }

  private _drawChildren = true;

  get drawChildren(): boolean {
    return this._drawChildren;
  }

  set drawChildren(value: boolean) {
    if (this._drawChildren == value) return;
    this._drawChildren = value;

    this.setDirty();
  }

  setDirty(first = true) {
    //if(this.log)console.log("F")
    this.isDirty = true;
    if (this.parent && !this.parent.isDirty) this.parent.setDirty(false);
    if (first) {
      this.setChildrenDirty();
    }
  }

  setSubComponents() {}

  setChildrenDirty() {
    for (let child of this.children) {
      child.isDirty = true;
      child.setChildrenDirty();
    }
  }

  removeChild(comp: Component) {
    let thisDrawBatch = UI_I.drawBatches.get(this.id);
    let compDrawBatch = UI_I.drawBatches.get(comp.id);
    if (thisDrawBatch && compDrawBatch) {
      thisDrawBatch.removeChild(compDrawBatch);
    }

    let index = this.children.indexOf(comp);
    comp.parent = null;

    this.children.splice(index, 1);
    this.setDirty();
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  addChild(comp: Component) {
    if (comp.parent) {
      comp.parent.removeChild(comp);
    }
    let thisDrawBatch = UI_I.drawBatches.get(this.id);
    let compDrawBatch = UI_I.drawBatches.get(comp.id);
    if (thisDrawBatch && compDrawBatch) {
      thisDrawBatch.addChild(compDrawBatch);
    }
    comp.parent = this;
    this.children.push(comp);
    comp.setDirty();
  }

  layoutRelativeInt() {
    if (this.isDirty || !this.hasOwnDrawBatch) {
      this.placeCursor.set(
        this.settings.box.paddingLeft,
        this.settings.box.paddingTop
      );

      if (this.parent) {
        if (this.settings.box.size.x < 0)
          this.size.x =
            -this.settings.box.size.x * Utils.getMaxInnerWidth(this.parent) -
            this.settings.box.marginLeft -
            this.settings.box.marginRight;
        if (this.settings.box.size.y < 0)
          this.size.y =
            -this.settings.box.size.y * Utils.getMaxInnerHeight(this.parent) -
            this.settings.box.marginTop -
            this.settings.box.marginBottom;
      }

      this.layoutRelative();
      if (this.drawChildren) {
        for (let child of this.children) {
          child.layoutRelativeInt();
        }
      }
      if (this.needsResize()) {
        this.placeCursor.set(
          this.settings.box.paddingLeft,
          this.settings.box.paddingTop
        );

        for (let child of this.children) {
          child.layoutRelativeInt();
        }
      }
      if (this.parent) {
        this.posRelative.x =
          this.parent.placeCursor.x +
          this.posOffset.x +
          this.posOffsetRelative.x * Utils.getMaxInnerWidth(this.parent);
        this.posRelative.y =
          this.parent.placeCursor.y +
          this.posOffset.y +
          this.posOffsetRelative.y * Utils.getMaxInnerHeight(this.parent);
      }
      if (this.settings.box.hAlign == HAlign.LEFT) {
        this.posRelative.x += this.settings.box.marginLeft;
      } else {
        this.posRelative.x -= this.settings.box.marginRight;
      }
      this.posRelative.y += this.settings.box.marginTop;
    }
    this.updateParentCursor();
  }

  needsResize() {
    return false;
  }

  updateParentCursor() {
    if (this.parent) {
      this.parent.updateCursor(this);
    }
  }

  updateCursor(comp: Component) {
    //extend
  }

  //first layout call
  //make sure to set the correct size
  layoutRelative() {
    //extend
  }

  layoutAbsoluteInt() {
    if (this.isDirty || !this.hasOwnDrawBatch) {
      if (this.parent) {
        this.posAbsolute.copy(this.parent.posAbsolute);
        this.posAbsolute.add(this.parent.scrollOffset);
        this.posAbsolute.add(this.posRelative);
        if (this.settings.box.hAlign == HAlign.RIGHT) {
          this.posAbsolute.x += this.parent.layoutRect.size.x;
          this.posAbsolute.x -= this.size.x;
        }
        this.layoutRect.copyPos(this.posAbsolute);
        this.layoutRect.copySize(this.size);
      } else {
        this.layoutRect.copySize(UI_I.screenSize);
      }
      this.clippingRect.copy(this.layoutRect);
      if (this.parent) {
        this.clippingRect.fitIn(this.parent.clippingRect);
      }
      if (this.clippingRect.size.x < 0 || this.clippingRect.size.y < 0) {
        this.clippingRect.size.set(0, 0);
      }
      this.layoutAbsolute();
      if (this.drawChildren) {
        for (let child of this.children) {
          child.layoutAbsoluteInt();
        }
      }
    }
  }

  //second layout call
  //from parent to child
  //this.layoutRect is finalised, dont change it, get your pos and size form the layout rect
  layoutAbsolute() {}

  getActiveDrawBatchIds(arr: Array<number>, parent: DrawBatch) {
    if (this.hasOwnDrawBatch) {
      if (!this.drawChildren) return;
      //if (parent.clipRect && !parent.clipRect.containsRect(this.clippingRect)) {
      if (this.clippingRect.size.x == 0) {
        return;
      }
      arr.push(this.id);
      let parentBatch =UI_I.drawBatches.get(this.id);
      if(!parentBatch)return;
      parent = parentBatch;
    }
    if (this.drawChildren) {
      for (let child of this.children) {
        child.getActiveDrawBatchIds(arr, parent);
      }
    }
  }

  prepDrawInt() {
    if (this.hasOwnDrawBatch) {
      //if (UI_I.currentDrawBatch.needsClipping) {
      /// this.clippingRect.resizeToFit(UI_I.currentDrawBatch.clipRect)
      //}
      if (this.clippingRect.size.x > 0)
        UI_I.pushDrawBatch(this.id, this.clippingRect, this.isDirty);
    }
    if (this.isDirty || !this.hasOwnDrawBatch) {
      // if (UI_I.currentDrawBatch.clipRect.containsRect(this.layoutRect)) this.prepDraw();
      if (this.clippingRect.size.x > 0) {
        this.prepDraw();
        if (this.drawChildren) {
          for (let child of this.children) {
            // if (UI_I.currentDrawBatch.clipRect.containsRect(child.layoutRect))
            child.prepDrawInt();
          }
        }
      }
    }
    if (this.hasOwnDrawBatch) {
      if (this.clippingRect.size.x > 0) UI_I.popDrawBatch();
    }
    this.isDirty = false;
  }

  prepDraw() {
    if (this.settings.hasBackground) {
      UI_I.currentDrawBatch.fillBatch.addRect(
        this.layoutRect,
        this.settings.backgroundColor
      );
    }
  }

  updateMouseInt() {
    if (!this.drawChildren) return;
    this.updateMouse();

    for (let child of this.children) {
      child.updateMouseInt();
    }
  }

  updateMouse() {}

  checkMouse(pos: Vec2): boolean {
    if (!this.drawChildren) return false;
    if (this.isClicked) {
      this.isClicked = false;
    }

    let isOver = true;
    let isChildrenOver = false;
    if (!this.alwaysPassMouse) {
      isOver = this.checkMouseOverLayout(pos);
    }

    if (isOver) {
      if (this.children.length) {
        for (let i = this.children.length - 1; i >= 0; i--) {
          isChildrenOver = this.children[i].checkMouse(pos);
          if (isChildrenOver) break;
        }
      }
    }
    if (this.alwaysPassMouse) {
      isOver = false;
    }
    if (isOver && !isChildrenOver) {
      UI_I.setMouseOverComponent(this);
    }
    if (isChildrenOver) isOver = true;
    //this.isOverLayout =isOver;

    return isOver;
  }

  setOverChild(value: boolean) {
    this.isOverChild = value;
    if (this.parent) this.parent.setOverChild(value);
  }

  checkMouseOverLayout(pos: Vec2) {
    let isOver = this.layoutRect.contains(pos);
    return isOver;
  }

  updateOnFocus() {
    //extend
  }

  updateOnMouseDown() {
    //extend
  }

  getReturnValue(): any {
    //extend
    return null;
  }

  sortChildrenByRenderOrder() {
    if (!this.sortIsDirty) return;
    this.children.sort((a, b) =>
      a.renderOrder > b.renderOrder ? 1 : b.renderOrder > a.renderOrder ? -1 : 0
    );
    this.sortIsDirty = false;
    this.setDirty();
  }

  destroy() {}

  onPopComponent() {}

  setKeys(buffer: string, actionKey: ActionKey) {}

  onMouseClicked() {}

  onAdded() {}

  onMouseUp() {}

  onMouseDown() {}

  getScrollComponent(): Component | null {
    if (this.hasScrollBar) return this;

    if (this.parent) return this.parent.getScrollComponent();
    return null;
  }

  public setScrollDelta(delta: number) {}

  pushID(newID: number) {
    this.idStack.push(newID);
    this.id = newID;
  }

  popID() {
    this.idStack.splice(this.idStack.length - 1, 1);
    this.id = this.idStack[this.idStack.length - 1];
  }
}

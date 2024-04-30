import Panel from "../components/Panel";
import Vec2 from "../math/Vec2";
import {DockSplit, DockType} from "./DockType";
import Rect from "../math/Rect";
import UI_I from "../UI_I";
import DockDivider, {DockDividerSettings,} from "../components/internal/DockDivider";
import UI_IC from "../UI_IC";

export default class DockNode {
    static idCount = 0;
    static border = 1;
    public size: Vec2 = new Vec2();
    public pos: Vec2 = new Vec2();
    public rect = new Rect();
    public panelID = 0;
    public panel: Panel | null = null;
    public children: Array<DockNode> = [];
    public parent: DockNode | null = null;
    public id: number;
    splitType!: DockSplit;
    private divider!: DockDivider;
    private dividerPos: Vec2 = new Vec2();
    private dividerMin: Vec2 = new Vec2();
    private dividerMax: Vec2 = new Vec2();

    constructor() {
        this.id = DockNode.idCount;
        DockNode.idCount++;
    }

    setDividers() {
        if (this.children.length) {
            this.divider = UI_IC.dockDivider(
                "DockDivider" + this.id,
                new DockDividerSettings(this.splitType)
            );
            this.divider.place(
                this,
                this.dividerPos,
                this.dividerMin,
                this.dividerMax
            );
        }

        for (let child of this.children) {
            child.setDividers();
        }
    }

    public updateLayout() {
        if (this.panel) {
            this.panel.size = this.size.clone();
            this.panel.posOffset = this.pos.clone();
            this.panel.saveToLocal();
            this.panel.setDirty();
        }
        for (let child of this.children) {
            child.updateLayout();
        }
        if (this.children.length) {
            this.dividerPos = this.pos.clone().add(this.size.clone().scale(0.5));
            this.dividerMin = this.dividerPos.clone();
            this.dividerMax = this.dividerPos.clone();
            if (this.splitType == DockSplit.Vertical) {
                let leftChild = this.children[0];
                if (this.children[0].pos.x > this.children[1].pos.x) {
                    leftChild = this.children[1];
                }

                this.dividerPos.x =
                    leftChild.pos.x + leftChild.size.x + DockNode.border / 2;
                this.dividerMin.x = this.pos.x + 50;
                this.dividerMax.x = this.pos.x + this.size.x - 50;
            } else {
                let topChild = this.children[0];
                if (this.children[0].pos.y > this.children[1].pos.y) {
                    topChild = this.children[1];
                }

                this.dividerPos.y =
                    topChild.pos.y + topChild.size.y + DockNode.border / 2;
                this.dividerMin.y = this.pos.y + 50;
                this.dividerMax.y = this.pos.y + this.size.y - 50;
            }
        }
    }

    setDividerPos(newPos: Vec2) {
        let size = newPos.clone().sub(this.pos);
        size.x -= DockNode.border / 2;
        size.y -= DockNode.border / 2;
        if (this.splitType == DockSplit.Vertical) {
            let leftChild = this.children[0];
            let rightChild = this.children[1];
            if (this.children[0].pos.x > this.children[1].pos.x) {
                leftChild = this.children[1];
                rightChild = this.children[0];
            }

            leftChild.size.x = size.x;
            rightChild.size.x = this.size.x - leftChild.size.x - DockNode.border;
            this.resize(this.size, true);
        }
        if (this.splitType == DockSplit.Horizontal) {
            let topChild = this.children[0];
            let bottomChild = this.children[1];
            if (this.children[0].pos.y > this.children[1].pos.y) {
                topChild = this.children[1];
                bottomChild = this.children[0];
            }

            topChild.size.y = size.y - DockNode.border / 2;
            bottomChild.size.y = this.size.y - topChild.size.y - DockNode.border;
            this.resize(this.size, true);
        }
        UI_I.dockManager.mainDockNode.updateLayout();
    }

    public resize(size: Vec2, force: boolean = false) {
        if (!force && this.size.equal(size)) return false;

        this.size = size.clone();

        this.updateRect();

        if (!this.children.length) return true;

        let totalWidth =
            this.children[0].size.x + this.children[1].size.x + DockNode.border;
        let totalHeight =
            this.children[0].size.y + this.children[1].size.y + DockNode.border;

        if (
            (this.children[0].panel || this.children[0].children.length) &&
            (this.children[1].panel || this.children[1].children.length)
        ) {
            ///resize even
            let factorX = this.children[0].size.x / totalWidth;
            let factorY = this.children[0].size.y / totalHeight;

            let size0 = new Vec2(this.size.x * factorX, this.size.y * factorY);
            let size1 = this.size.clone().sub(size0);
            if (this.splitType == DockSplit.Vertical) {
                size1.x -= DockNode.border;
                size0.y = size1.y = this.size.y;
                if (this.children[0].pos.x < this.children[1].pos.x) {
                    this.children[0].pos = this.pos.clone();
                    this.children[1].pos = this.pos.clone();
                    this.children[1].pos.x += size0.x + DockNode.border;
                } else {
                    this.children[1].pos = this.pos.clone();
                    this.children[0].pos = this.pos.clone();
                    this.children[0].pos.x += size1.x + DockNode.border;
                }
            } else {
                size1.y -= DockNode.border;
                size0.x = size1.x = this.size.x;

                if (this.children[0].pos.y < this.children[1].pos.y) {
                    this.children[0].pos = this.pos.clone();
                    this.children[1].pos = this.pos.clone();
                    this.children[1].pos.y += size0.y + DockNode.border;
                } else {
                    this.children[1].pos = this.pos.clone();
                    this.children[0].pos = this.pos.clone();
                    this.children[0].pos.y += size1.y + DockNode.border;
                }
            }

            this.children[0].resize(size0, force);
            this.children[1].resize(size1, force);
        } else {
            let panelSize: Vec2 = new Vec2();
            let clearSize: Vec2 = new Vec2();
            let panelChild = this.children[0];
            let clearChild = this.children[1];
            if (this.children[1].panel) {
                panelChild = this.children[1];
                clearChild = this.children[0];
            }
            if (this.splitType == DockSplit.Vertical) {
                panelSize.y = clearSize.y = this.size.y;
                panelSize.x = panelChild.size.x;
                clearSize.x = this.size.x - panelSize.x - DockNode.border;
                if (clearSize.x < 0) return;

                if (panelChild.pos.x < clearChild.pos.x) {
                    panelChild.pos = this.pos.clone();
                    clearChild.pos = this.pos.clone();
                    clearChild.pos.x += panelSize.x + DockNode.border;
                } else {
                    clearChild.pos = this.pos.clone();
                    panelChild.pos = this.pos.clone();
                    panelChild.pos.x += clearSize.x + DockNode.border;
                }
            } //horizontal
            else {
                panelSize.x = clearSize.x = this.size.x;
                panelSize.y = panelChild.size.y;
                clearSize.y = this.size.y - panelSize.y - DockNode.border;

                if (clearSize.y < 0) return;
                if (panelChild.pos.y < clearChild.pos.y) {
                    panelChild.pos = this.pos.clone();
                    clearChild.pos = this.pos.clone();
                    clearChild.pos.y += panelSize.y + DockNode.border;
                } else {
                    clearChild.pos = this.pos.clone();
                    panelChild.pos = this.pos.clone();
                    panelChild.pos.y += clearSize.y + DockNode.border;
                }
            }

            panelChild.resize(panelSize, force);
            clearChild.resize(clearSize, force);
        }

        return true;
    }

    public setContentRect(panel: Panel, type: DockType) {
        this.panel = panel;
        if (!this.parent) return;
        this.size = this.parent.size.clone();
        this.pos = this.parent.pos.clone();
        if (type == DockType.LeftCenter) {
            this.size.x = panel.size.x;
        } else if (type == DockType.RightCenter) {
            this.pos.x += this.size.x - panel.size.x;
            this.size.x = panel.size.x;
        } else if (type == DockType.TopCenter) {
            this.size.y = panel.size.y;
        } else if (type == DockType.BottomCenter) {
            this.pos.y = this.pos.y + this.size.y - panel.size.y;
            this.size.y = panel.size.y;
        }
        this.updateRect();
    }

    public setContentRectInverse(panel: Panel, type: DockType) {
        if (!this.parent) return;
        this.size = this.parent.size.clone();
        this.pos = this.parent.pos.clone();
        if (type == DockType.LeftCenter) {
            this.size.x -= panel.size.x + DockNode.border;
            this.pos.x += panel.size.x + DockNode.border;
        } else if (type == DockType.RightCenter) {
            this.size.x -= panel.size.x + DockNode.border;
        } else if (type == DockType.TopCenter) {
            this.size.y -= panel.size.y + -DockNode.border;
            this.pos.y += panel.size.y + DockNode.border;
        } else if (type == DockType.BottomCenter) {
            this.size.y -= panel.size.y + DockNode.border;
        }
        this.updateRect();
    }

    public split(type: DockType, panel: Panel) {
        if (type == DockType.LeftCenter || type == DockType.RightCenter) {
            this.splitType = DockSplit.Vertical;
        } else {
            this.splitType = DockSplit.Horizontal;
        }

        if (this.panel) {
            let childNew = new DockNode();
            childNew.parent = this;
            childNew.panel = panel;
            this.children.push(childNew);

            let childOld = new DockNode();
            childOld.parent = this;
            childOld.panel = this.panel;
            this.children.push(childOld);

            this.panel = null;

            let size = this.size.clone();

            if (type == DockType.LeftCenter || type == DockType.RightCenter) {
                size.x = size.x / 2 - DockNode.border / 2;
            } else {
                size.y = size.y / 2 - DockNode.border / 2;
            }

            let posNew = this.pos.clone();
            let posOld = this.pos.clone();

            if (type == DockType.LeftCenter) {
                posOld.x += size.x + DockNode.border;
            } else if (type == DockType.RightCenter) {
                posNew.x += size.x + DockNode.border;
            }
            if (type == DockType.TopCenter) {
                posOld.y += size.y + DockNode.border;
            } else if (type == DockType.BottomCenter) {
                posNew.y += size.y + DockNode.border;
            }
            childNew.size = size;
            childNew.pos = posNew;
            childNew.updateRect();
            childOld.size = size;
            childOld.pos = posOld;
            childOld.updateRect();
        } else {
            let childNew = new DockNode();
            childNew.parent = this;
            childNew.setContentRect(panel, type);
            this.children.push(childNew);

            let childOld = new DockNode();
            childOld.parent = this;
            childOld.setContentRectInverse(panel, type);
            this.children.push(childOld);
        }
    }

    set(panel: Panel) {
        this.splitType = DockSplit.Center;
        this.panel = panel;
    }

    public getOverNode(mousePos: Vec2): DockNode | null {
        if (this.children.length) {
            for (let child of this.children) {
                let node = child.getOverNode(mousePos);
                if (node) return node;
            }
        }
        if (this.rect.contains(mousePos)) return this;
        return null;
    }

    getNodeWithPanel(panel: Panel): DockNode | null {
        if (this.panel === panel) {
            return this;
        }
        for (let child of this.children) {
            let node = child.getNodeWithPanel(panel);
            if (node) return node;
        }
        return null;
    }

    getDocStructure(data: any) {
        data.panelID = null;
        if (this.panel) data.panelID = this.panel.id;
        data.splitType = this.splitType;
        data.children = [];
        data.size = this.size;
        data.pos = this.pos;
        for (let child of this.children) {
            let dataS = {};
            child.getDocStructure(dataS);
            data.children.push(dataS);
        }
    }

    setLocalData(dockData: any) {
        this.size.copy(dockData.size);
        this.pos.copy(dockData.pos);
        this.splitType = dockData.splitType as DockSplit;

        if (dockData.panelID) {
            this.panelID = dockData.panelID;
        }
        for (let child of dockData.children) {
            let node = new DockNode();
            node.parent = this;
            node.setLocalData(child);
            this.children.push(node);
        }
    }

    setPanels() {
        if (this.panelID != 0) {
            this.panel = UI_I.components.get(this.panelID) as Panel;
            if (!this.panel) {
                let panel = UI_I.dockManager.panelsByOldId.get(this.panelID);
                if (panel) this.panel = panel;
            }
            if (this.panel) {
                this.panel.isDocked = true;

                this.size.copy(this.panel.size);
                this.pos.copy(this.panel.posOffset);
                this.updateRect();
            }
        }
        for (let child of this.children) {
            child.setPanels();
        }
    }

    private updateRect() {
        this.rect.copySize(this.size);
        this.rect.copyPos(this.pos);
    }
}

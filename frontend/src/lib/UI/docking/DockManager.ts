import Panel from "../components/Panel";
import Layer from "../components/Layer";
import UI_I from "../UI_I";
import {DockIndicatorSettings} from "../components/internal/DockIndicator";
import DockNode from "./DockNode";
import {DockSplit, DockType} from "./DockType";
import Local from "../local/Local";
import UI_IC from "../UI_IC";
import DockTabData from "./DockTabData";
import UI from "../UI";
import DockingPanel from "../components/internal/DockingPanel";

export default class DockManager {
    public mainDockNode: DockNode;
    public panelsByOldId: Map<number, DockingPanel> = new Map();
    private dockLayer: Layer;
    private overlayLayer: Layer;
    private dragComponent: Panel | null = null;
    private setPanelsFirst: number = 0;
    private tabItems: Array<DockTabData> = [];
    private dockingPanels: Array<DockingPanel> = [];

    constructor(dockLayer: Layer, overlayLayer: Layer) {
        this.dockLayer = dockLayer;
        this.overlayLayer = overlayLayer;
        this.overlayLayer.hasOwnDrawBatch = true;

        this.mainDockNode = new DockNode();
        this.setPanelsFirst = 0;
        if (Local.dockData) {
            if (Local.dockData.dockData)
                this.mainDockNode.setLocalData(Local.dockData.dockData);
        }
    }

    public startDragging(panel: Panel) {
        console.log("startDragg")
        let node = this.mainDockNode.getNodeWithPanel(panel);
        if (node) {
            if (node.splitType === DockSplit.Center) {
                node.panel = null;
            } else if (node.parent) {
                let parent = node.parent;
                let keepNode: DockNode;

                if (parent.children[0].panel === panel) {
                    keepNode = parent.children[1];
                } else {
                    keepNode = parent.children[0];
                }

                parent.panel = keepNode.panel;

                parent.children = keepNode.children;
                if (parent.children.length) {
                    parent.children[0].parent = parent;
                    parent.children[1].parent = parent;
                }
            } else {
                node.children = [];
                node.panel = null;
            }
            let size = UI_I.screenSize.clone()

            size.scale(1 / UI_I.pixelRatio)

            this.mainDockNode.resize(size, true);
            this.mainDockNode.updateLayout();
            this.saveLocal();
        }

        this.tabItems = [];
        this.collectTabItems(UI_I.panelDockingLayer);
        this.collectTabItems(UI_I.panelLayer);
        this.dragComponent = panel;
    }

    public stopDragging(panel: Panel) {
        this.dragComponent = null;

        this.mainDockNode.updateLayout();
        this.overlayLayer.setDirty(true);
        this.dockLayer.setDirty(true);
    }

    update() {
        //wait for panels rendered 1 time
        if (this.setPanelsFirst == 1) {
            this.setPanelsFirst++;
            this.restoreLocalData();
        }
        if (this.setPanelsFirst < 1) {
            this.setPanelsFirst++;
            return;
        }
        let size = UI_I.screenSize.clone()

        size.scale(1 / UI_I.pixelRatio)

        if (this.mainDockNode.resize(size)) {
            this.mainDockNode.updateLayout();
        }

        if (this.dragComponent) {
            for (let item of this.tabItems) {
                UI_IC.dockTabIndicator(item);
            }

            let overNode = this.mainDockNode.getOverNode(UI_I.mouseListener.mousePos);

            if (overNode) {
                if (!overNode.panel)
                    UI_IC.dockIndicator(
                        overNode.id + "CenterDockIndicator" + overNode.id,
                        new DockIndicatorSettings(DockType.Center, overNode)
                    );

                UI_IC.dockIndicator(
                    overNode.id + "rightCenterDockIndicator",
                    new DockIndicatorSettings(DockType.RightCenter, overNode)
                );
                UI_IC.dockIndicator(
                    overNode.id + "leftCenterDockIndicator",
                    new DockIndicatorSettings(DockType.LeftCenter, overNode)
                );
                UI_IC.dockIndicator(
                    overNode.id + "topCenterDockIndicator",
                    new DockIndicatorSettings(DockType.TopCenter, overNode)
                );
                UI_IC.dockIndicator(
                    overNode.id + "bottomCenterDockIndicator",
                    new DockIndicatorSettings(DockType.BottomCenter, overNode)
                );
            }
        }

        this.mainDockNode.setDividers();
    }

    split(type: DockType, doc: DockNode) {
        if (!this.dragComponent) return;
        if (
            type == DockType.Left ||
            type == DockType.Right ||
            type == DockType.Top ||
            type == DockType.Bottom
        ) {
        } else if (type == DockType.Center) {
            doc.set(this.dragComponent);
            this.dragComponent.isDocked = true;
        } else {
            doc.split(type, this.dragComponent);
            this.dragComponent.isDocked = true;
        }

        this.mainDockNode.updateLayout();

        this.saveLocal();

        this.dragComponent = null;
    }

    swapDock(oldPanel: Panel, newPanel: Panel) {
        let node = this.mainDockNode.getNodeWithPanel(oldPanel);
        newPanel.isDocked = true;
        if (node) node.panel = newPanel;
    }

    dockInPanel(panel: Panel) {
        if (!this.dragComponent) return;
        if (panel instanceof DockingPanel) {
            this.dragComponent.setDockInPanel(panel);
            (panel as DockingPanel).addPanelChild(this.dragComponent);
            this.saveLocal();
        } else if (this.dragComponent instanceof DockingPanel) {
            console.log("drag docked nodes in panel, implement some swapping around");
        } else {
            let dockNode = null;
            if (panel.isDocked) {
                dockNode = this.mainDockNode.getNodeWithPanel(panel);
            }
            this.dragComponent.setDockInPanel(panel);

            let dockingPanel = UI.dockingPanel(panel, this.dragComponent);
            this.dockingPanels.push(dockingPanel);
            if (dockNode) {
                dockingPanel.isDocked = true;
                dockNode.panel = dockingPanel;
            }
            this.saveLocal();
        }
        this.dragComponent = null;
        this.overlayLayer.setDirty(true);
    }

    public saveLocal() {
        let data =
            {
                panelData: [],
                dockData: {}
            };

        for (let i = 0; i < this.dockingPanels.length; i++) {
            let p = this.dockingPanels[i];
            //removeOldPanels
            if (p.children.length == 0) {
                this.dockingPanels.splice(i, 1);
                i--;
            } else {
                // @ts-ignore
                data.panelData.push(p.getSaveData());
            }
        }
        this.mainDockNode.getDocStructure(data.dockData);
        Local.setDockData(data);
    }

    private collectTabItems(layer: Layer) {
        for (let child of layer.children) {
            let tabData = new DockTabData();
            tabData.panel = child as Panel;
            tabData.rect.copy(tabData.panel.layoutRect);

            tabData.rect.size.y = 22;

            this.tabItems.push(tabData);
        }
    }

    private restoreLocalData() {
        if (!Local.dockData) return;

        if (Local.dockData.panelData) {
            for (let pd of Local.dockData.panelData) {
                let lsData = Local.getAndDeletItem(pd.id); //remove old docked ids, new one will be saved;
                if (pd.children.length == 0) continue;
                let comp1 = UI_I.components.get(pd.children[0]) as Panel;
                let comp2 = UI_I.components.get(pd.children[1]) as Panel;

                comp1.size.set(lsData["size"].x, lsData["size"].y);
                comp1.posOffset.set(lsData["posOffset"].x, lsData["posOffset"].y);
                let dockingPanel = UI.dockingPanel(comp1, comp2);
                this.dockingPanels.push(dockingPanel);

                for (let i = 2; i < pd.children.length; i++) {
                    let comp = UI_I.components.get(pd.children[i]) as Panel;
                    dockingPanel.addPanelChild(comp);
                }
                dockingPanel.selectIndex(pd.index);
                if (lsData.collapsed) {
                    dockingPanel.collapsed = true;
                }
                this.panelsByOldId.set(pd.id, dockingPanel);
            }
        }

        //set the panels in the docknodes
        this.mainDockNode.setPanels();
        let size = UI_I.screenSize.clone()

        size.scale(1 / UI_I.pixelRatio)

        this.mainDockNode.resize(size, true);
        this.mainDockNode.updateLayout();

        this.saveLocal();
    }
}

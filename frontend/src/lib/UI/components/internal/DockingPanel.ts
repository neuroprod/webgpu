import Panel, {PanelSettings} from "../Panel";
import UI_I from "../../UI_I";
import UI_IC from "../../UI_IC";

export class DockingPanelSettings extends PanelSettings {
    constructor() {
        super();
    }
}

export default class DockingPanel extends Panel {
    private panels: Array<Panel> = [];
    private selectedIndex: number = 0;

    constructor(
        id: number,
        panelMain: Panel,
        panelChild: Panel,
        settings: DockingPanelSettings
    ) {
        super(id, "", settings);
        this.keepAlive = true;
        let idParent = 0;
        if (panelMain.parent) idParent = panelMain.parent.id;
        UI_I.generateDrawBatch(id, idParent, this.clippingRect);

        panelChild.removeFromParent(); //.parent.removeChild(panelChild);
        panelMain.removeFromParent(); //.parent.removeChild(panelMain);
        this.panels.push(panelMain);
        this.panels.push(panelChild);

        this.posOffset.copy(panelMain.posOffset);
        this.size.copy(panelMain.size);

        panelMain.setIsDockedInPanel(true);
        panelChild.setIsDockedInPanel(true);

        this.selectedIndex = 1;
        this.addChild(panelMain);
        this.addChild(panelChild);
        panelMain.drawChildren = false;
        this.saveToLocal();
    }

    setSubComponents() {
        super.setSubComponents();

        for (let i = 0; i < this.panels.length; i++) {
            let p: Panel = this.panels[i];

            let tb = UI_IC.tabButton(p.label);
            tb.setTabData(
                i,
                this.panels.length,
                this.selectedIndex == i,
                this.isDocked ? 0 : 20
            );

            if (tb.release) {
                p.setIsDockedInPanel(false);
                this.panels.splice(i, 1);
                i++;
                p.drawChildren = true;
                UI_I.panelDragLayer.addChild(p);
                UI_I.dockManager.startDragging(p);
                UI_I.setMouseDownComponent(p);
                if (this.selectedIndex > this.panels.length - 1) this.selectedIndex--;

                p.isDragging = true;
                let dir = UI_I.mouseListener.mousePosDown.clone();
                dir.sub(UI_I.mouseListener.mousePos);

                p.startDragPos.copy(UI_I.mouseListener.mousePos);
                p.startDragPos.add(dir);
                p.startDragPos.x -= 40;
                p.startDragPos.y -= 10;
                p.posOffset.copy(p.startDragPos);
                p.setDirty();

                if (this.panels.length == 1) {
                    this.swapDockingPanelWithLastPanel();
                }
                UI_I.dockManager.saveLocal();
            } else if (tb.isClicked) {
                if (tb.index != this.selectedIndex) {
                    this.panels[this.selectedIndex].drawChildren = false;
                    this.selectedIndex = tb.index;

                    this.panels[tb.index].drawChildren = true;
                    UI_I.dockManager.saveLocal();
                }
            }
            if (this._collapsed) {
                p.drawChildren = false;
            } else {
                if (i == this.selectedIndex) p.drawChildren = true;
            }
        }
    }

    addPanelChild(panelChild: Panel) {
        panelChild.removeFromParent(); //parent.removeChild(panelChild);
        this.panels.push(panelChild);
        panelChild.setIsDockedInPanel(true);
        this.addChild(panelChild);
        this.panels[this.selectedIndex].drawChildren = false;
        this.selectedIndex = this.panels.length - 1;
    }

    getSaveData() {
        let a = {
            id: this.id,
            index: this.selectedIndex,
            children: new Array<number>(),
        };
        for (let p of this.panels) {
            a.children.push(p.id);
        }
        return a;
    }

    selectIndex(index: number) {
        this.panels[this.selectedIndex].drawChildren = false;
        this.selectedIndex = index;
        this.panels[this.selectedIndex].drawChildren = true;
    }

    private swapDockingPanelWithLastPanel() {
        this.keepAlive = false;
        let p = this.panels[0];
        this.panels = [];
        p.setIsDockedInPanel(false);
        p.drawChildren = true;
        p.posOffset.copy(this.posOffset);
        p.size.copy(this.size);
        if (this.parent) this.parent.addChild(p);

        if (this.isDocked) {
            UI_I.dockManager.swapDock(this, p);
        }
    }
}

import RendererGL from "./GL/RendererGL";
import Layer from "./components/Layer";
import Component, {ComponentSettings} from "./components/Component";
import Panel from "./components/Panel";
import DrawBatch from "./draw/DrawBatch";
import Font from "./draw/Font";
import MouseListener from "./input/MouseListener";
import DockManager from "./docking/DockManager";
import Vec2 from "./math/Vec2";

import Local from "./local/Local";

import UI_Style from "./UI_Style";
import KeyboardListener from "./input/KeyboardListener";
import EventCenter, {EventCenterSettings,} from "./components/internal/EventCenter";
import RendererGPU from "./GPU/RendererGPU";
import Rect from "./math/Rect";
import Renderer from "../Renderer";

export default class UI_I {
    public static currentComponent: Component;
    public static components = new Map<number, Component>();
    static currentDrawBatch: DrawBatch;
    static mouseListener: MouseListener;
    public static dockManager: DockManager;
    static screenSize: Vec2 = new Vec2();
    static canvasSize: Vec2 = new Vec2();

    static pixelRatio: number;

    static renderType: string;
    static numDrawCalls: number = 0;
    public static globalStyle: UI_Style;

    public static drawBatches = new Map<number, DrawBatch>();
    static mainComp: Layer;
    static panelDockingLayer: Layer;
    static panelLayer: Layer;
    static panelDragLayer: Layer;
    static popupLayer: Layer;
    static overlayLayer: Component;
    static panelDockingDividingLayer: Layer;
    static focusComponent: Component | null = null;
    static groupDepth: number = 0;
    static eventLayer: EventCenter;
    static crashed: boolean = false;
    static rendererGPU: RendererGPU;
    static rendererGL: RendererGL;
    private static mainDrawBatch: DrawBatch;
    static mouseOverComponent: Component | null = null;
    private static mouseDownComponent: Component | null = null;
    private static canvas: HTMLCanvasElement;
    private static keyboardListener: KeyboardListener;
    private static oldDrawBatchIDs: number[] = [];

    constructor() {
    }

    static setSize(width, height) {
        this.screenSize.set(width, height);
        this.canvasSize.set(width, height)


    }

    static init(canvas) {

        this.pixelRatio = window.devicePixelRatio;

        this.globalStyle = new UI_Style();

        // this.setSize(canvas.offsetWidth, this.canvas.offsetHeight);

        Local.init();
        Font.init();

        this.mouseListener = new MouseListener(canvas);
        this.keyboardListener = new KeyboardListener();
        let layerSettings = new ComponentSettings();
        layerSettings.box.size = this.screenSize;

        UI_I.mainComp = new Layer(UI_I.getHash("mainLayer"), layerSettings);

        UI_I.currentComponent = UI_I.mainComp;

        UI_I.panelDockingLayer = new Layer(
            UI_I.getID("dockingLayer"),
            layerSettings
        );
        UI_I.addComponent(UI_I.panelDockingLayer);
        this.popComponent();

        UI_I.panelDockingDividingLayer = new Layer(
            UI_I.getID("dockingDividingLayer"),
            layerSettings
        );
        UI_I.addComponent(UI_I.panelDockingDividingLayer);
        this.popComponent();

        UI_I.panelLayer = new Layer(UI_I.getID("panelLayer"), layerSettings);
        UI_I.addComponent(UI_I.panelLayer);
        this.popComponent();

        UI_I.panelDragLayer = new Layer(
            UI_I.getID("panelDragLayer"),
            layerSettings
        );
        UI_I.addComponent(UI_I.panelDragLayer);
        this.popComponent();

        UI_I.popupLayer = new Layer(UI_I.getID("popupLayer"), layerSettings);
        UI_I.addComponent(UI_I.popupLayer);
        this.popComponent();

        UI_I.overlayLayer = new Layer(
            UI_I.getID("dockingOverLayer"),
            layerSettings
        );
        UI_I.addComponent(UI_I.overlayLayer);
        this.popComponent();

        UI_I.eventLayer = new EventCenter(
            UI_I.getID("eventLayer"),
            new EventCenterSettings()
        );
        UI_I.addComponent(UI_I.eventLayer);
        this.popComponent();

        UI_I.dockManager = new DockManager(
            UI_I.panelDockingLayer,
            UI_I.overlayLayer
        );

        UI_I.mainDrawBatch = new DrawBatch(UI_I.mainComp.id);
        UI_I.currentDrawBatch = UI_I.mainDrawBatch;
    }

    //handle components
    static setComponent(localID: string) {
        const id = this.getID(localID);
        if (this.hasComponent(id)) {
            this.currentComponent = <Component>this.components.get(id);

            if (this.currentComponent.parent) {
                this.currentComponent.renderOrder =
                    this.currentComponent.parent.renderOrderCount;
                this.currentComponent.useThisFrame = true;
                this.currentComponent.parent.renderOrderCount++;
                this.currentComponent.setSubComponents();
                this.currentComponent.onAdded();
            }
            return true;
        }
        return false;
    }

    static addComponent(component: Component) {
        this.components.set(component.id, component);

        component.renderOrder = this.currentComponent.renderOrderCount;

        this.currentComponent.renderOrderCount++;
        this.currentComponent.addChild(component);
        if (
            this.currentComponent.needsChildrenSortingByRenderOrder &&
            component.renderOrder != this.currentComponent.children.length - 1
        ) {
            this.currentComponent.sortIsDirty = true;
        }

        this.currentComponent = component;
        this.currentComponent.useThisFrame = true;
        this.currentComponent.setDirty(true);
        this.currentComponent.setSubComponents();
        this.currentComponent.onAdded();
    }

    static deleteComponent(comp: Component) {
        this.components.delete(comp.id);
        comp.setDirty();
        for (let child of comp.children) {
            child.useThisFrame = false;
        }
        if (comp.parent) {
            let index = comp.parent.children.indexOf(comp);
            comp.parent.children.splice(index, 1);
            comp.parent.setDirty();
            comp.parent = null;
        }
        comp.destroy();
        if (comp.hasOwnDrawBatch) {
            let batch = this.drawBatches.get(comp.id);
            if (batch && batch.parent) {
                let index = batch.parent.children.indexOf(batch);
                batch.parent?.children.splice(index, 1);
                batch.parent = null;
            }
            this.drawBatches.delete(comp.id);
            if (UI_I.renderType == "gl") {
                this.rendererGL.delete(comp.id);
            }
            if (UI_I.renderType == "gpu") {
                this.rendererGPU.delete(comp.id);
            }
        }
    }

    static popComponent(callPop = true) {
        if (callPop) {
            this.currentComponent.onPopComponent();
        }

        this.currentComponent = <Component>this.currentComponent.parent;
        this.currentComponent.useThisFrame = true;
    }

    static hasComponent(id: number) {
        return this.components.has(id);
    }

    static getID(seed: string) {
        return this.getHash(UI_I.currentComponent.id + seed + " ");
    }

    static getHash(str: string) {
        let hash = 0;
        const l = str.length;
        for (let i = 0; i < l; i++) {
            let char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    static removePopup(p: Component) {
        p.keepAlive = false;
    }

    ////input
    static checkMouse() {
        if (this.mouseListener.isDirty < 0) return;

        let mousePos = this.mouseListener.mousePos;

        if (this.mouseListener.isDownThisFrame && this.popupLayer.children.length) {
            for (let i = this.popupLayer.children.length - 1; i >= 0; i--) {
                if (!this.popupLayer.children[i].checkMouseOverLayout(mousePos)) {
                    this.popupLayer.children[i].keepAlive = false;
                } else {
                    break;
                }
            }
        }

        if (!this.mainComp.checkMouse(mousePos)) {
            this.setMouseOverComponent(null);
        }
        if (this.mouseDownComponent) {
            this.mouseDownComponent.isDownThisFrame = false;
        }
        if (this.mouseListener.isDownThisFrame) {
            this.setMouseDownComponent(this.mouseOverComponent);
            this.setFocusComponent(this.mouseOverComponent);
        }
        if (this.mouseListener.isUpThisFrame) {
            if (this.mouseDownComponent) {
                if (this.mouseOverComponent === this.mouseDownComponent) {
                    this.mouseDownComponent.isClicked = true;
                    this.mouseDownComponent.onMouseClicked();
                }

                this.mouseDownComponent.onMouseUp();
                this.mouseDownComponent.isDown = false;
                this.mouseDownComponent = null;
            }
        }
        this.mouseListener.reset();

        if (this.focusComponent) this.focusComponent.updateOnFocus();
        if (this.mouseDownComponent) this.mouseDownComponent.updateOnMouseDown();
    }

    static checkWheel() {
        if (this.mouseListener.wheelDelta == 0) return;
        if (!this.mouseOverComponent) return;

        let delta = this.mouseListener.wheelDelta;

        this.mouseListener.wheelDelta = 0;
        let sc = this.mouseOverComponent.getScrollComponent();
        if (sc) sc.setScrollDelta(delta);
    }

    static setMouseDownComponent(comp: Component | null) {
        this.mouseDownComponent = comp;

        if (this.mouseDownComponent) {
            this.mouseDownComponent.isDown = true;
            this.mouseDownComponent.isDownThisFrame = true;
            this.mouseDownComponent.onMouseDown();
            this.mouseDownComponent.setDirty();
            this.setPanelFocus(this.mouseDownComponent);
        }
    }

    static setMouseOverComponent(comp: Component | null) {
        if (comp === this.mouseOverComponent) {
            return;
        }
        if (this.mouseOverComponent) {
            this.mouseOverComponent.isOver = false;
            this.mouseOverComponent.setOverChild(false);
            this.mouseOverComponent.setDirty();
        }
        this.mouseOverComponent = comp;
        if (this.mouseOverComponent) {
            if (
                this.mouseDownComponent &&
                this.mouseDownComponent != this.mouseOverComponent
            )
                return;

            this.mouseOverComponent.isOver = true;
            this.mouseOverComponent.setOverChild(true);
            this.mouseOverComponent.setDirty();
        }
    }

    static setPanelFocus(comp: Component) {
        let numPanels = this.panelLayer.children.length;
        if (numPanels < 2) {
            //1 or 0 panel, no need to change
            return;
        }
        while (comp.parent && !(comp instanceof Panel)) {
            comp = comp.parent;
        }

        if (!comp.parent) {
            //not a child of panel or panel
            return;
        }
        //comp is the panel now;
        let panelLayer = comp.parent;

        if (panelLayer.children[numPanels - 1] === comp) {
            return;
        }

        //set panel to the back (=draw on top);
        let index = panelLayer.children.indexOf(comp);
        panelLayer.children.splice(index, 1);
        panelLayer.children.push(comp);

        //also update drawBatches
        if (!this.drawBatches.has(comp.id)) {
            return;
        }
        let batch = this.drawBatches.get(comp.id);
        if (batch) {
            let batchParent = batch.parent;
            if (batchParent) {
                index = batchParent.children.indexOf(batch);
                batchParent.children.splice(index, 1);
                batchParent.children.push(batch);
            }
        }
    }

    static setFocusComponent(comp: Component | null) {
        if (this.focusComponent) {
            if (this.focusComponent == comp) return;
            this.focusComponent.isFocus = false;
            this.focusComponent.setDirty();
        }
        this.focusComponent = comp;

        if (this.focusComponent) {
            this.focusComponent.isFocus = true;
            this.focusComponent.setDirty();
        }
    }

    //impl
    public static setWebgl(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        canvas: HTMLCanvasElement,
        settings?: any
    ) {
        UI_I.renderType = "gl";
        UI_I.rendererGL = new RendererGL();
        UI_I.rendererGL.init(gl, canvas);

        if (settings) Local.setSettings(settings);
        UI_I.init(canvas);
    }

    static setWebGPU(
        renderer: Renderer,
        settings?: any
    ) {
        UI_I.renderType = "gpu";
        UI_I.rendererGPU = new RendererGPU();
        UI_I.rendererGPU.init(renderer.device, renderer.presentationFormat);
        if (settings) Local.setSettings(settings);
        UI_I.init(renderer.canvas);
    }

    resize(width: number, height: number) {

    }

    //draw
    public static draw() {
        this.update();
        if (UI_I.renderType == "gl") {
            UI_I.rendererGL.draw();
        }
    }

    public static update() {

        this.dockManager.update();
        if (UI_I.renderType == "gpu") {
            UI_I.rendererGPU.setProjection();
        }

        this.components.forEach((comp) => {
            if (comp.keepAlive) {
                this.currentComponent = comp;
                comp.setSubComponents();
            }
            if (comp.useThisFrame == false) {
                this.deleteComponent(comp);
            }
            if (comp.isDirty && comp.needsChildrenSortingByRenderOrder) {
                comp.sortChildrenByRenderOrder();
            }
        });

        this.checkMouse();
        this.checkWheel();
        let buffer = this.keyboardListener.getBuffer();
        let actionKey = this.keyboardListener.getActionKey();
        if (this.focusComponent) {
            this.focusComponent.setKeys(buffer, actionKey);
        }
        if (this.mainComp.isDirty) {
            this.mainDrawBatch.isDirty = true;

            this.mainComp.updateMouseInt();
            this.mainComp.layoutRelativeInt();
            this.mainComp.layoutAbsoluteInt();
            this.mainComp.prepDrawInt();

            //remove old batches
            let drawBatchIds = new Array<number>();
            this.mainComp.getActiveDrawBatchIds(drawBatchIds, this.mainDrawBatch);
            for (let old of this.oldDrawBatchIDs) {
                if (!drawBatchIds.includes(old)) {
                    this.removeDrawBatch(old);
                }
            }
            this.oldDrawBatchIDs = drawBatchIds;

            //collect drawBatches
            let drawBatches: Array<DrawBatch> = [];
            this.mainDrawBatch.collectBatches(drawBatches);
            if (UI_I.rendererGL) {
                UI_I.rendererGL.setDrawBatches(drawBatches);
            } else if (UI_I.rendererGPU) {
                UI_I.rendererGPU.setDrawBatches(drawBatches);
            }
            this.mainComp.isDirty = false;
        }

        this.components.forEach((comp) => {
            comp.renderOrderCount = 0;
            if (!comp.keepAlive) {
                comp.useThisFrame = false;
            }
        });
        Local.saveData();
    }

    static pushDrawBatch(id: number, clipRect: Rect, isDirty: boolean) {
        let batch = this.drawBatches.get(id);
        if (batch) {
            batch.isDirty = isDirty;
            batch.clear();
        } else {
            batch = new DrawBatch(id, clipRect);
            this.drawBatches.set(id, batch);
            this.currentDrawBatch.addChild(batch);

            batch.isDirty = true;
        }

        batch.useThisUpdate = true;
        this.currentDrawBatch = batch;
    }

    static generateDrawBatch(
        id: number,
        parentDrawBatchID: number,
        clipRect: Rect
    ) {
        let batch = new DrawBatch(id, clipRect);
        this.drawBatches.set(id, batch);

        let parent = this.drawBatches.get(parentDrawBatchID)
        if (parent) parent.addChild(batch);
    }

    static popDrawBatch() {
        if (this.currentDrawBatch.parent)
            this.currentDrawBatch = this.currentDrawBatch.parent;
    }

    static removeDrawBatch(id: number) {
        let batch = this.drawBatches.get(id);
        if (!batch) return;

        if (batch.parent) {
            batch.parent.removeChild(batch);
        }
        this.drawBatches.delete(id);
    }
}

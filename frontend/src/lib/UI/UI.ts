import UI_I from "./UI_I";

import Panel from "./components/Panel";
import LSlider, {LSliderSettings} from "./components/LSlider";
import LButton, {LButtonSettings} from "./components/LButton";
import {LTextSettings} from "./components/LText";
import LColor, {LColorSettings} from "./components/LColor";
import LBoolean, {LBooleanSettings} from "./components/LBoolean";
import Group, {GroupSettings} from "./components/Group";
import UITexture from "./draw/UITexture";
import LTexture, {LTextureSettings} from "./components/LTexture";
import LTextInput, {LTextInputSettings} from "./components/LTextInput";
import Local from "./local/Local";
import Viewport, {ViewportSettings} from "./components/Viewport";
import WindowComp, {WindowSettings} from "./components/WindowComp";
import SelectItem from "./math/SelectItem";
import {LSelectSettings} from "./components/LSelect";
import {LNumberSettings} from "./components/LNumber";
import DockingPanel, {DockingPanelSettings,} from "./components/internal/DockingPanel";
import {SeparatorSettings} from "./components/Separator";
import {NumberType} from "./UI_Enums";
import UI_Vars from "./UI_Vars";
import UI_IC from "./UI_IC";
import {UI_COLOR, UI_VEC2, UI_VEC3, UI_VEC4} from "./UI_Types";
import LVector, {LVectorSettings} from "./components/LVector";
import LList, {LListSettings} from "./components/LList";
import LListItem, {LListItemSettings} from "./components/LListItem";
import Renderer from "../Renderer";
import ButtonGroup, {ButtonGroupSettings} from "./components/ButtonGroup";

export default class UI {
    private static viewPort: Viewport | null;
    public static initialized: boolean = false;

    static set floatPrecision(val: number) {
        if (!UI.initialized) return;
        UI_Vars.floatPrecision = val;
    }

    static setWebgl(
        gl: WebGL2RenderingContext | WebGLRenderingContext,
        canvas: HTMLCanvasElement,
        settings?: any
    ) {
        if (UI.initialized) {
            console.warn("UI already initialized, ");
            UI_I.crashed = true;
            return;
        }

        UI_I.setWebgl(gl, canvas, settings);
        UI.initialized = true;
    }

    static setWebGPU(
        renderer: Renderer, settings?: any
    ) {
        if (UI.initialized) {
            console.warn("UI already initialized, ");
            UI_I.crashed = true;
            return;
        }
        UI_I.setWebGPU(renderer, settings);
        UI.initialized = true;
    }

    static setSize(width, height) {

        UI_I.setSize(width, height)
    }

    static draw() {
        if (!UI.initialized) return;
        UI_I.draw();
    }

    static pushWindow(label: string, settings?: WindowSettings) {
        if (!UI.initialized) return;
        UI_I.currentComponent = UI_I.panelLayer;

        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new WindowSettings();
            let comp = new WindowComp(UI_I.getID(label), label, settings);

            UI_I.addComponent(comp);
        }
    }

    static popWindow() {
        if (!UI.initialized) return;
        UI_I.popComponent();
        UI_I.popComponent();
    }

    static pushViewport(
        label: string,
        view: UI_VEC4,
        settings?: ViewportSettings
    ): UI_VEC4 {
        if (!this.initialized) return view;

        UI_I.currentComponent = UI_I.panelLayer;
        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new ViewportSettings();
            let comp = new Viewport(UI_I.getID(label), label, settings);
            UI_I.addComponent(comp);
        }

        let vp = UI_I.currentComponent as Viewport;
        UI_I.popComponent();

        if (vp.collapsed) {
            UI.viewPort = null;
            return view;
        }
        if (vp.isDocked) {
            UI.viewPort = null;

            view.x = vp.layoutRect.pos.x * UI_I.pixelRatio;
            view.y =
                (UI_I.screenSize.y - vp.layoutRect.pos.y - vp.layoutRect.size.y) *
                UI_I.pixelRatio;
            view.z = vp.layoutRect.size.x * UI_I.pixelRatio;
            view.w = vp.layoutRect.size.y * UI_I.pixelRatio;
            return view;
        }
        UI.viewPort = vp;

        vp.startRender();
        view.z = vp.renderSize.x;
        view.w = vp.renderSize.y;
        return view;
    }

    static popViewport() {
        //  if(!UI.initialized) return false
        if (!UI.viewPort) return;
        UI.viewPort.stopRender();
    }

    static pushGroup(label: string, settings?: GroupSettings) {
        if (!UI.initialized) return;
        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new GroupSettings();
            let comp = new Group(UI_I.getID(label), label, settings);
            UI_I.addComponent(comp);
        }
        UI_I.groupDepth++;
    }

    static pushButtonGroup(label: string, settings?: ButtonGroupSettings) {
        if (!UI.initialized) return;
        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new ButtonGroupSettings();
            let comp = new ButtonGroup(UI_I.getID(label), label, settings);
            UI_I.addComponent(comp);
        }
        UI_I.groupDepth++;
        let result = UI_I.currentComponent.parent.getReturnValue();
        return result;

    }

    static popGroup() {
        if (!UI.initialized) return;
        UI_I.groupDepth--;
        UI_I.popComponent();
        UI_I.popComponent();
    }

    static pushLList(
        label: string,
        size: number = 200,
        settings?: LListSettings
    ) {
        if (!UI.initialized) return;
        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new LListSettings();
            let comp = new LList(UI_I.getID(label), label, size, settings);
            UI_I.addComponent(comp);
        }
    }

    static logEvent(label: string, text: string, isError: boolean = false) {
        if (!UI.initialized) return;
        UI_IC.logEvent(label, text, isError);
    }

    static LListItem(label: string, selected: boolean = false) {
        if (!UI.initialized) return false;
        if (!UI_I.setComponent(label)) {
            let comp = new LListItem(
                UI_I.getID(label),
                label,
                new LListItemSettings()
            );
            UI_I.addComponent(comp);
        }
        (UI_I.currentComponent as LListItem).setSelected(selected);
        let result = UI_I.currentComponent.getReturnValue();
        UI_I.popComponent();
        return result;
    }

    static popList() {
        if (!UI.initialized) return;
        UI_I.popComponent();
        UI_I.popComponent();
    }

    static setIndent(value: number) {
        if (!UI.initialized) return;
        UI_I.globalStyle.compIndent = value;
    }

    static setLLabelSize(size?: number) {
        if (!UI.initialized) return;
        if (!size) size = UI_I.globalStyle.defaultLabelSize;
        UI_I.globalStyle.setLabelSize(size);
    }

    static LSelect(
        label: string,
        items: Array<SelectItem>,
        index = 0,
        settings?: LSelectSettings
    ) {
        if (!UI.initialized) return items[index].value;
        return UI_IC.LSelect(label, items, index, settings);
    }

    static LButton(
        buttonText: string,
        label: string = "",
        settings?: LButtonSettings
    ): boolean {
        if (!UI.initialized) return false;
        let id = buttonText + label;

        if (!UI_I.setComponent(id)) {
            if (!settings) settings = new LButtonSettings();
            let comp = new LButton(UI_I.getID(id), label, buttonText, settings);
            UI_I.addComponent(comp);
        }
        let result = UI_I.currentComponent.getReturnValue();
        UI_I.popComponent();
        return result;
    }

    static LColor(
        label: string = "",
        color: UI_COLOR,
        settings?: LColorSettings
    ): UI_COLOR {
        if (!UI.initialized) return color;
        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new LColorSettings();
            let comp = new LColor(UI_I.getID(label), label, color, settings);
            UI_I.addComponent(comp);
        }
        let result = UI_I.currentComponent.getReturnValue();
        UI_I.popComponent();
        return result;
    }

    static LText(
        text: string,
        label: string = "",
        multiLine: boolean = false,
        settings?: LTextSettings
    ) {
        if (!UI.initialized) return;
        return UI_IC.LText(text, label, multiLine, settings);
    }

    static separator(
        id: string = "",
        idAsLabel: boolean = true,
        settings?: SeparatorSettings
    ) {
        if (!UI.initialized) return;
        UI_IC.separator(id, idAsLabel, settings);
    }

    static LTexture(
        label: string,
        texture: UITexture,
        settings?: LTextureSettings
    ) {
        if (!UI.initialized) return;
        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new LTextureSettings();
            let comp = new LTexture(UI_I.getID(label), label, texture, settings);
            UI_I.addComponent(comp);
        }
        UI_I.popComponent();
    }

    static LTextInput(
        label: string,
        value: string,
        empty?: string,
        settings?: LTextInputSettings
    ): string;
    static LTextInput(
        label: string,
        ref: any,
        property: string,
        settings?: LTextInputSettings
    ): string;
    static LTextInput(
        label: string,
        ref_or_value: any,
        property: string,
        settings?: LTextInputSettings
    ) {
        if (!UI.initialized) {
            if (typeof ref_or_value === "string") {
                return ref_or_value;
            } else {
                return ref_or_value[property];
            }
        }
        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new LTextInputSettings();
            if (!property) property = "";
            let comp = new LTextInput(
                UI_I.getID(label),
                label,
                ref_or_value,
                property,
                settings
            );
            UI_I.addComponent(comp);
        }

        let result = UI_I.currentComponent.getReturnValue();
        UI_I.popComponent();
        return result;
    }

    static LBool(
        label: string,
        value: boolean,
        settings?: LBooleanSettings
    ): boolean;
    static LBool(
        ref: any,
        property: string,
        settings?: LBooleanSettings
    ): boolean;
    static LBool(
        ref_or_label: any,
        property_or_value: any,
        settings?: LBooleanSettings
    ) {
        if (!UI.initialized) {
            if (typeof property_or_value === "string") {
                return ref_or_label[property_or_value];
            } else {
                return property_or_value;
            }
        }

        let label;
        let ref = null;
        let value = null;

        //v shouldn't be here
        if (typeof property_or_value === "string") {
            label = property_or_value;
            ref = ref_or_label;
        } else {
            label = ref_or_label;
            value = property_or_value;
        }

        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new LBooleanSettings();
            let comp = new LBoolean(UI_I.getID(label), label, value, ref, settings);
            UI_I.addComponent(comp);
        }

        let result = UI_I.currentComponent.getReturnValue();
        UI_I.popComponent();
        return result;
    }

    static LVector(
        label: string,
        vector: UI_VEC2 | UI_VEC3 | UI_VEC4,
        normalized = false,
        settings?: LVectorSettings
    ) {
        if (!UI.initialized) {
            return vector;
        }
        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new LVectorSettings();
            let comp = new LVector(
                UI_I.getID(label),
                label,
                vector,
                normalized,
                settings
            );
            UI_I.addComponent(comp);
        }

        let result = UI_I.currentComponent.getReturnValue();
        UI_I.popComponent();
        return result;
    }

    static LFloatSlider(
        label: string,
        value: number,
        min?: number,
        max?: number,
        settings?: LSliderSettings
    ): number;
    static LFloatSlider(
        ref: any,
        property: string,
        min?: number,
        max?: number,
        settings?: LSliderSettings
    ): number;
    static LFloatSlider(
        ref_or_label: any,
        property_or_value: any,
        min?: number,
        max?: number,
        settings?: LSliderSettings
    ) {
        if (!UI.initialized) {
            if (typeof property_or_value === "string") {
                return ref_or_label[property_or_value];
            } else {
                return property_or_value;
            }
        }

        let label;
        let ref = null;
        let value = null;
        if (typeof property_or_value === "string") {
            label = property_or_value;
            ref = ref_or_label;
        } else {
            label = ref_or_label;
            value = property_or_value;
        }

        if (!UI_I.setComponent(label)) {
            if (!settings) settings = new LSliderSettings();
            let comp = new LSlider(
                UI_I.getID(label),
                label,
                value,
                ref,
                settings,
                min,
                max,
                NumberType.FLOAT
            );
            UI_I.addComponent(comp);
        }
        let result = UI_I.currentComponent.getReturnValue();
        UI_I.popComponent();
        return result;
    }

    static LFloat(
        label: string,
        value: number,
        settings?: LNumberSettings
    ): number;
    static LFloat(ref: any, property: string, settings?: LNumberSettings): number;
    static LFloat(
        ref_or_label: any,
        property_or_value: any,
        settings?: LNumberSettings
    ) {
        if (!UI.initialized) {
            if (typeof property_or_value === "string") {
                return ref_or_label[property_or_value];
            } else {
                return property_or_value;
            }
        }
        return UI_IC.LFloat(ref_or_label, property_or_value, settings);
    }

    static LIntSlider(
        label: string,
        value: number,
        min?: number,
        max?: number,
        settings?: LSliderSettings
    ): number;
    static LIntSlider(
        ref: any,
        property: string,
        min?: number,
        max?: number,
        settings?: LSliderSettings
    ): number;
    static LIntSlider(
        ref_or_label: any,
        property_or_value: any,
        min?: number,
        max?: number,
        settings?: LSliderSettings
    ) {
        if (typeof property_or_value === "string") {
            return ref_or_label[property_or_value];
        } else {
            return property_or_value;
        }
        return UI_IC.LIntSlider(
            ref_or_label,
            property_or_value,
            min,
            max,
            settings
        );
    }

    //shouldnt be here
    static dockingPanel(panelMain: Panel, panelChild: Panel): DockingPanel {
        if (panelMain.parent) UI_I.currentComponent = panelMain.parent;
        let id = panelMain.id + Date.now() + " ";

        if (!UI_I.setComponent(id)) {
            let settings = new DockingPanelSettings();
            let comp = new DockingPanel(
                UI_I.getID(id),
                panelMain,
                panelChild,
                settings
            );

            UI_I.addComponent(comp);
        }
        let comp = UI_I.currentComponent as DockingPanel;
        UI_I.popComponent();
        return comp;
    }

    static needsMouse() {

        if (UI_I.mouseOverComponent) return true;
        return false;
    }

    static clearLocalData() {
        if (!UI.initialized) return;
        Local.clearLocalData();
    }

    static saveLocalData() {
        if (!UI.initialized) return;
        Local.saveToJson();
    }

    static pushID(s: string) {
        if (!UI.initialized) return;
        let newID = UI_I.getID(s);
        UI_I.currentComponent.pushID(newID);
    }

    static popID() {
        if (!UI.initialized) return;
        UI_I.currentComponent.popID();
    }

    static updateGPU() {
        UI_I.update();
    }

    static drawGPU(passEncoder: GPURenderPassEncoder, needsDepth: boolean) {
        UI_I.rendererGPU.draw(passEncoder, needsDepth);
    }
}

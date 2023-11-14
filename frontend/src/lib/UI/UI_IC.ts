//internal components
import UI_I from "./UI_I";

import SliderBase, {
  SliderBaseSettings,
} from "./components/internal/SliderBase";
import DirtyButton, {
  DirtyButtonSettings,
} from "./components/internal/DirtyButton";
import SettingsButton, {
  SettingsButtonSettings,
} from "./components/internal/SettingsButton";
import ButtonBase, {
  ButtonBaseSettings,
} from "./components/internal/ButtonBase";
import ColorButton, {
  ColorButtonSettings,
} from "./components/internal/ColorButton";
import ColorPickerPopUp, {
  ColorPickerPopupSettings,
} from "./components/internal/popUps/ColorPickerPopUp";
import LColor from "./components/LColor";
import LSlider, { LSliderSettings } from "./components/LSlider";
import Color from "./math/Color";
import ColorPicker, {
  ColorPickerSettings,
} from "./components/internal/ColorPicker";
import CheckBox, { CheckBoxSettings } from "./components/internal/CheckBox";
import GroupTitle, {
  GroupTitleSettings,
} from "./components/internal/GroupTitle";
import UITexture from "./draw/UITexture";
import Texture, { TextureSettings } from "./components/internal/Texture";
import InputBase, { InputBaseSettings } from "./components/internal/InputBase";
import ToggleIcon, {
  ToggleIconSettings,
} from "./components/internal/ToggleIcon";
import SelectPopUp, {
  SelectPopUpSettings,
} from "./components/internal/popUps/SelectPopUp";
import SliderPopUp, {
  SliderPopUpSettings,
} from "./components/internal/popUps/SliderPopUp";
import SelectItem from "./math/SelectItem";
import Vec2 from "./math/Vec2";
import VerticalLayout, {
  VerticalLayoutSettings,
} from "./components/VerticalLayout";
import SelectButton, {
  SelectButtonSettings,
} from "./components/internal/SelectButton";
import DragBase, { DragBaseSettings } from "./components/internal/DragBase";
import DockIndicator, {
  DockIndicatorSettings,
} from "./components/internal/DockIndicator";
import DockDivider, {
  DockDividerSettings,
} from "./components/internal/DockDivider";
import DockTabData from "./docking/DockTabData";

import DockPanelIndicator, {
  DockPanelIndicatorSettings,
} from "./components/internal/DockPanelIndicator";

import TabButton, { TabButtonSettings } from "./components/internal/TabButton";
import { NumberType } from "./UI_Enums";
import IconButton, {
  IconButtonSettings,
} from "./components/internal/IconButton";

import LText, { LTextSettings } from "./components/LText";
import LNumber, { LNumberSettings } from "./components/LNumber";
import Separator, { SeparatorSettings } from "./components/Separator";
import Component, { ComponentSettings } from "./components/Component";
import Viewport from "./components/Viewport";
import ViewportPopUp, {
  ViewportPopUpSettings,
} from "./components/internal/popUps/ViewportPopUp";
import LVector from "./components/LVector";
import DragPopUp, {
  DragPopUpSettings,
} from "./components/internal/popUps/DragPopUp";

import LSelect, { LSelectSettings } from "./components/LSelect";
import Event, { EventSettings } from "./components/internal/Event";
export default class UI_IC {
  static LFloat(
    ref_or_label: any,
    property_or_value: any,
    settings?: LNumberSettings
  ): number {
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
      if (!settings) settings = new LNumberSettings();

      let comp = new LNumber(
        UI_I.getID(label),
        label,
        value,
        ref,
        settings,
        NumberType.FLOAT
      );
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
    if (!UI_I.setComponent(text)) {
      if (!settings) settings = new LTextSettings();
      let comp = new LText(UI_I.getID(text), label, text, multiLine, settings);
      UI_I.addComponent(comp);
    }
    UI_I.popComponent();
  }

  static LSelect(
    label: string,
    items: Array<SelectItem>,
    index = 0,
    settings?: LSelectSettings
  ): any {
    if (!UI_I.setComponent(label)) {
      if (!settings) settings = new LSelectSettings();
      let comp = new LSelect(UI_I.getID(label), label, items, index, settings);
      UI_I.addComponent(comp);
    }
    let result = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return result;
  }

  static pushComponent(id: string, settings: ComponentSettings) {
    if (!UI_I.setComponent(id)) {
      if (!settings) settings = new ComponentSettings();
      let comp = new Component(UI_I.getID(id), settings);
      UI_I.addComponent(comp);
    }
  }
  static dockIndicator(name: string, settings: DockIndicatorSettings) {
    UI_I.currentComponent = UI_I.overlayLayer;

    if (!UI_I.setComponent(name)) {
      let comp = new DockIndicator(UI_I.getID(name), settings);
      UI_I.addComponent(comp);
    }

    UI_I.popComponent();
  }

  static dockDivider(name: string, settings: DockDividerSettings): DockDivider {
    UI_I.currentComponent = UI_I.panelDockingDividingLayer;
    if (!UI_I.setComponent(name)) {
      let comp = new DockDivider(UI_I.getID(name), settings);
      UI_I.addComponent(comp);
    }
    let divider = UI_I.currentComponent as DockDivider;
    UI_I.popComponent();
    return divider;
  }

  static pushVerticalLayout(label: string, settings?: VerticalLayoutSettings) {
    if (!UI_I.setComponent(label)) {
      if (!settings) settings = new VerticalLayoutSettings();
      let comp = new VerticalLayout(UI_I.getID(label), settings);
      UI_I.addComponent(comp);
    }
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
  ): number {
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
        NumberType.INT
      );
      UI_I.addComponent(comp);
    }
    let result = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return result;
  }
  static logEvent(label: string, text: string, isError: boolean = false) {
    let prevComp = UI_I.currentComponent;
    UI_I.currentComponent = UI_I.eventLayer;
    if (!UI_I.setComponent(label)) {
      let comp = new Event(
        UI_I.getID(label),
        label,
        text,
        isError,
        new EventSettings()
      );
      UI_I.addComponent(comp);
    } else {
      (UI_I.currentComponent as Event).updateText(text);
    }

    UI_I.currentComponent = prevComp;
  }
  static sliderBase(
    ref: any,
    objName: string,
    settings?: SliderBaseSettings
  ): SliderBase {
    if (!UI_I.setComponent(objName)) {
      if (!settings) settings = new SliderBaseSettings();
      let comp = new SliderBase(UI_I.getID(objName), ref, objName, settings);
      UI_I.addComponent(comp);
    }
    let v = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return v;
  }
  static separator(
    id: string = "",
    idAsLabel: boolean = true,
    settings?: SeparatorSettings
  ) {
    if (!UI_I.setComponent(id)) {
      if (!settings) settings = new SeparatorSettings();
      let comp = new Separator(UI_I.getID(id), id, idAsLabel, settings);
      UI_I.addComponent(comp);
    }
    UI_I.popComponent();
  }
  static dragBase(
    name: string,
    ref: any,
    objName: string,
    type: NumberType,
    settings?: DragBaseSettings
  ): SliderBase {
    if (!UI_I.setComponent(name)) {
      if (!settings) settings = new DragBaseSettings();
      let comp = new DragBase(UI_I.getID(name), ref, objName, type, settings);
      UI_I.addComponent(comp);
    }
    let v = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return v;
  }

  static colorButton(name:string, color:Color, settings?: ColorButtonSettings) {
    if (!UI_I.setComponent(name)) {
      if (!settings) settings = new ColorButtonSettings();
      let comp = new ColorButton(UI_I.getID(name), color, settings);
      UI_I.addComponent(comp);
    }
    let comp = UI_I.currentComponent;
    UI_I.popComponent();
    return comp.getReturnValue();
  }

  //doesn't call pop!!!
  static dirtyButton(name:string, settings?: DirtyButtonSettings) {
    if (!UI_I.setComponent(name)) {
      if (!settings) settings = new DirtyButtonSettings();
      let comp = new DirtyButton(UI_I.getID(name), settings);
      UI_I.addComponent(comp);
    }
    let comp = UI_I.currentComponent;
    return comp.getReturnValue();
  }

  static texture(name:string, texture: UITexture, settings?: TextureSettings) {
    if (!UI_I.setComponent(name)) {
      if (!settings) settings = new TextureSettings();
      let comp = new Texture(UI_I.getID(name), texture, settings);
      UI_I.addComponent(comp);
    }
    UI_I.popComponent();
  }

  static selectButton(buttonText: string, settings?: SelectButtonSettings) {
    if (!UI_I.setComponent(buttonText)) {
      if (!settings) settings = new SelectButtonSettings();
      let comp = new SelectButton(UI_I.getID(buttonText), buttonText, settings);
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
  }

  static settingsButton(name:string, settings?: SettingsButtonSettings) {
    if (!UI_I.setComponent(name)) {
      if (!settings) settings = new SettingsButtonSettings();
      let comp = new SettingsButton(UI_I.getID(name), settings);
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
  }

  static groupTitle(
    label: string,
    isOpen: boolean,
    settings?: GroupTitleSettings
  ) {
    if (!UI_I.setComponent(label)) {
      if (!settings) settings = new GroupTitleSettings();
      let comp = new GroupTitle(UI_I.getID(label), label, isOpen, settings);
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
  }

  static toggleIcon(
    name: string,
    ref: any,
    prop: string,
    iconTrue: number,
    iconFalse: number,
    settings?: ToggleIconSettings
  ): boolean {
    if (!UI_I.setComponent(name)) {
      if (!settings) settings = new ToggleIconSettings();
      let comp = new ToggleIcon(
        UI_I.getID(name),
        ref,
        prop,
        iconTrue,
        iconFalse,
        settings
      );
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
  }

  static inputBase(
    name: string,
    ref: any,
    prop: string,
    settings?: InputBaseSettings,
    noPop?: boolean
  ): boolean {
    if (!UI_I.setComponent(name)) {
      if (!settings) settings = new InputBaseSettings();
      let comp = new InputBase(UI_I.getID(name), ref, prop, settings);
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    if (!noPop) UI_I.popComponent();
    return retValue;
  }
  static tabButton(
    buttonText: string,
    settings?: TabButtonSettings
  ): TabButton {
    if (!UI_I.setComponent(buttonText)) {
      if (!settings) settings = new TabButtonSettings();
      let comp = new TabButton(UI_I.getID(buttonText), buttonText, settings);
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
  }
  static buttonBase(buttonText: string, settings?: ButtonBaseSettings) {
    if (!UI_I.setComponent(buttonText)) {
      if (!settings) settings = new ButtonBaseSettings();
      let comp = new ButtonBase(UI_I.getID(buttonText), buttonText, settings);
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
  }
  static iconButton(id: string, icon: number, settings?: IconButtonSettings) {
    if (!UI_I.setComponent(id)) {
      if (!settings) settings = new IconButtonSettings();
      let comp = new IconButton(UI_I.getID(id), icon, settings);
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
  }

  static checkBox(
    label: string,
    ref: any,
    obj: string,
    settings?: CheckBoxSettings
  ) {
    if (!UI_I.setComponent(label)) {
      if (!settings) settings = new CheckBoxSettings();
      let comp = new CheckBox(UI_I.getID(label), label, ref, obj, settings);
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
  }

  static colorPicker(
    name: string,
    color: Color,
    settings?: ColorPickerSettings
  ) {
    if (!UI_I.setComponent(name)) {
      if (!settings) settings = new ColorPickerSettings();
      let comp = new ColorPicker(UI_I.getID(name), color, settings);
      UI_I.addComponent(comp);
    }
    let retValue = UI_I.currentComponent.getReturnValue();
    UI_I.popComponent();
    return retValue;
  }

  // Popups
  static viewportPopUp(
    comp: Viewport,
    pos: Vec2,
    settings: ViewportPopUpSettings = new ViewportPopUpSettings()
  ) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let compPopup = new ViewportPopUp(
      UI_I.getID(comp.id + ""),
      comp,
      pos,
      settings
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
  }
  static sliderPopUp(
    comp: LSlider,
    pos: Vec2,
    settings: SliderPopUpSettings = new SliderPopUpSettings()
  ) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let compPopup = new SliderPopUp(
      UI_I.getID(comp.id + ""),
      comp,
      pos,
      settings
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
  }
  static dragPopUp(
    comp: LNumber | LVector,
    pos: Vec2,
    name: string,
    settings: DragPopUpSettings = new DragPopUpSettings()
  ) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let compPopup = new DragPopUp(
      UI_I.getID(comp.id + ""),
      comp,
      pos,
      name,
      settings
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
  }
  static colorPickerPopUp(
    comp: LColor,
    settings: ColorPickerPopupSettings = new ColorPickerPopupSettings()
  ) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let compPopup = new ColorPickerPopUp(
      UI_I.getID(comp.id + ""),
      comp,
      settings
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
  }

  static selectPopUp(
    callBack: (item: SelectItem) => void,
    pos: Vec2,
    targetWidth = -1,
    items: Array<SelectItem>,
    index = 0,
    settings: SelectPopUpSettings = new SelectPopUpSettings()
  ) {
    let old = UI_I.currentComponent;

    UI_I.currentComponent = UI_I.popupLayer;
    let compPopup = new SelectPopUp(
      UI_I.getID("select"),
      callBack,
      pos,
      targetWidth,
      items,
      index,
      settings
    );
    UI_I.addComponent(compPopup);

    UI_I.currentComponent = old;
  }

  static dockTabIndicator(item: DockTabData) {
    UI_I.currentComponent = UI_I.overlayLayer;
    let id = item.panel.id + "__";
    if (!UI_I.setComponent(id)) {
      let settings = new DockPanelIndicatorSettings();
      let comp = new DockPanelIndicator(UI_I.getID(id), item, settings);
      UI_I.addComponent(comp);
    }

    UI_I.popComponent();
  }
}

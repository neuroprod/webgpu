import PopUp, {PopUpSettings} from "./PopUp";
import SelectItem from "../../../math/SelectItem";
import Vec2 from "../../../math/Vec2";
import UI_I from "../../../UI_I";
import UI_IC from "../../../UI_IC";
import {ButtonBaseSettings} from "../ButtonBase";
import {SelectButtonSettings} from "../SelectButton";

export class SelectPopUpSettings extends PopUpSettings {
}

export default class SelectPopUp extends PopUp {
    private items: Array<SelectItem>;
    private btnSettings: ButtonBaseSettings;
    private callBack: (item: SelectItem) => void;
    private index: number;
    private btnSSettings: SelectButtonSettings;

    constructor(
        id: number,
        callBack: (item: SelectItem) => void,
        pos: Vec2,
        targetWidth = -1,
        items: Array<SelectItem>,
        index = 0,
        settings: SelectPopUpSettings
    ) {
        super(id, settings);
        let itemSize = 20;
        this.posOffset = pos;
        let maxSize = UI_I.screenSize.y - pos.y - 10;
        this.size.set(targetWidth, Math.min(itemSize * items.length, maxSize));
        this.settings.box.size.copy(this.size);
        this.items = items;
        this.btnSettings = new ButtonBaseSettings();
        this.btnSettings.box.size.y = itemSize;
        this.btnSettings.backColor.a = 0;

        this.btnSSettings = new SelectButtonSettings();
        this.btnSSettings.box.size.y = itemSize;
        this.btnSSettings.backColor.gray(0.3);
        this.btnSSettings.iconBoxColor.a = 0;
        this.callBack = callBack;
        this.index = index;
    }

    setSubComponents() {
        super.setSubComponents();
        UI_IC.pushVerticalLayout("v");

        if (UI_IC.selectButton(this.items[this.index].label, this.btnSSettings)) {
            UI_I.removePopup(this);
        }

        for (let i = 0; i < this.items.length; i++) {
            if (i == this.index) continue;
            if (UI_IC.buttonBase(this.items[i].label, this.btnSettings)) {
                this.callBack(this.items[i]);
                UI_I.removePopup(this);
            }
        }
        UI_I.popComponent();
    }
}

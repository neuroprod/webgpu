import LComponent, {LComponentSettings} from "./LComponent";
import UI_IC from "../UI_IC";
import SelectItem from "../math/SelectItem";
import Utils from "../math/Utils";
import UI_I from "../UI_I";
import DirtyButton from "./internal/DirtyButton";
import {SelectButtonSettings} from "./internal/SelectButton";

export class LSelectSettings extends LComponentSettings {
    constructor() {
        super();
        this.canCopyToClipBoard = true;
    }
}

export default class LSelect extends LComponent {
    private buttonText: string;
    private items: Array<SelectItem>;
    private currentIndex: number;
    private startIndex: number;
    private selectBtnSettings: SelectButtonSettings;

    constructor(
        id: number,
        label: string,
        items: Array<SelectItem>,
        index = 0,
        settings: LSelectSettings
    ) {
        super(id, label, settings);
        this.currentIndex = index;
        this.startIndex = index;
        this.items = items;

        this.buttonText = items[index].label;
        this.selectBtnSettings = new SelectButtonSettings();
        this.selectBtnSettings.box.marginLeft = 4;
    }

    setSubComponents() {
        super.setSubComponents();

        if (UI_IC.selectButton(this.buttonText, this.selectBtnSettings)) {
            let pos = this.layoutRect.pos.clone();
            pos.x += this.settings.box.paddingLeft;
            let width = Utils.getMaxInnerWidth(this);
            UI_IC.selectPopUp(
                this.setSelection.bind(this),
                pos,
                width,
                this.items,
                this.currentIndex
            );
        }

        if (UI_IC.dirtyButton("LSdb")) {
            this.currentIndex = this.startIndex;
            this.buttonText = this.items[this.currentIndex].label;
            this.setDirty();
            this.setValueDirty(false);
        }

        (UI_I.currentComponent as DirtyButton).setValueDirty(this.valueDirty);

        UI_I.popComponent();
    }

    setSelection(item: SelectItem) {
        this.currentIndex = this.items.indexOf(item);
        this.buttonText = this.items[this.currentIndex].label;

        if (this.currentIndex == this.startIndex) {
            this.setValueDirty(false);
        } else {
            this.setValueDirty(true);
        }
    }

    getReturnValue(): any {
        return this.items[this.currentIndex].value;
    }

    getClipboardValue(): string {
        return this.items[this.currentIndex].value + "";
    }
}

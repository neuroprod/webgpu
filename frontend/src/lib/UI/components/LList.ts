import LComponent, {LComponentSettings} from "./LComponent";
import UI_IC from "../UI_IC";
import {VerticalLayoutSettings} from "./VerticalLayout";

export class LListSettings extends LComponentSettings {
}

export default class LList extends LComponent {
    private vlSettings: VerticalLayoutSettings;

    constructor(
        id: number,
        label: string,
        size: number,
        settings: LListSettings
    ) {
        super(id, label, settings);
        this.vlSettings = new VerticalLayoutSettings();
        settings.box.size.y = size;

        this.size.copy(settings.box.size);
        this.vlSettings.box.size.y = size;

        this.vlSettings.needScrollBar = true;
    }

    setSubComponents() {
        super.setSubComponents();
        UI_IC.pushVerticalLayout("vl", this.vlSettings);
    }
}

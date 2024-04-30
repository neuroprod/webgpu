import Component, {ComponentSettings} from "../Component";
import Color from "../../math/Color";
import UI_I from "../../UI_I";
import Utils from "../../math/Utils";
import Vec2 from "../../math/Vec2";
import Font from "../../draw/Font";

export class GroupTitleSettings extends ComponentSettings {
    constructor() {
        super();
        this.box.marginLeft = 4;
        this.box.size.set(-1, 20);
    }

    public boxColor = new Color().setHex("#65625e", 1);
    public boxColorOver = new Color().setHex("#868480", 1);
    public labelColor: Color = new Color().setHex("#ffffff", 1);
}

export default class GroupTitle extends Component {
    private label: string;
    private textPos: Vec2 = new Vec2();
    private iconPos: Vec2 = new Vec2();
    private textMaxSize: number = 0;
    private isOpen: boolean;

    constructor(
        id: number,
        label: string,
        isOpen: boolean,
        settings: GroupTitleSettings
    ) {
        super(id, settings);

        this.size.copy(settings.box.size);
        this.label = label;
        this.isOpen = isOpen;
    }

    onMouseClicked() {
        this.isOpen = !this.isOpen;
    }

    layoutRelative() {
        super.layoutRelative();
        let settings = this.settings as GroupTitleSettings;
        if (settings.box.size.x == -1)
            this.size.x =
                Utils.getMaxInnerWidth(this.parent) -
                settings.box.marginLeft -
                settings.box.marginRight;
        if (settings.box.size.y == -1)
            this.size.y =
                Utils.getMaxInnerHeight(this.parent) -
                settings.box.marginTop -
                settings.box.marginRight;
    }

    layoutAbsolute() {
        super.layoutAbsolute();

        this.textPos.copy(this.layoutRect.pos);
        this.textPos.x += 30;
        this.textPos.y += Utils.getCenterPlace(
            Font.charSize.y,
            this.layoutRect.size.y
        );
        this.textMaxSize = this.layoutRect.size.x - 25;

        this.iconPos.copy(this.layoutRect.pos);
        this.iconPos.x += 5;
        this.iconPos.y += Utils.getCenterPlace(
            Font.iconSize.y,
            this.layoutRect.size.y
        );
    }

    prepDraw() {
        if (this.layoutRect.size.x < 0) return;
        super.prepDraw();

        let settings = this.settings as GroupTitleSettings;

        let color = settings.boxColor;
        if (this.isOver) {
            color = settings.boxColorOver;
        }

        UI_I.currentDrawBatch.fillBatch.addRect(this.layoutRect, color);
        UI_I.currentDrawBatch.textBatch.addLine(
            this.textPos,
            this.label,
            this.textMaxSize,
            settings.labelColor
        );
        let icon = 2;
        if (this.isOpen) icon = 1;
        UI_I.currentDrawBatch.textBatch.addIcon(
            this.iconPos,
            icon,
            settings.labelColor
        );
    }

    getReturnValue() {
        return this.isOpen;
    }
}

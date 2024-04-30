import Object3D from "./lib/core/Object3D";
import Renderer from "./lib/Renderer";
import {Vector4} from "math.gl";
import UI from "./lib/UI/UI";
import ColorV from "./lib/ColorV";

export default class MainLight extends Object3D {
    color = new Vector4(1.00, 0.69, 0.64, 5);
    colorTemp: ColorV = new ColorV(1.00, 0.69, 0.64, 5);

    constructor(renderer: Renderer, label: string) {
        super(renderer, label);


    }

    initColor() {
        this.colorTemp.r = this.color.x;
        this.colorTemp.g = this.color.y;
        this.colorTemp.b = this.color.z;
        this.colorTemp.w = 1;
    }

    onDataUI() {
        UI.pushGroup(this.label)

        UI.LColor("color", this.colorTemp)
        let mainLightStrength = UI.LFloatSlider("strength", this.color.w, 0, 20);
        this.color.x = this.colorTemp.r;
        this.color.y = this.colorTemp.g;
        this.color.z = this.colorTemp.b;

        this.color.w = mainLightStrength;
        UI.popGroup()

    }

}

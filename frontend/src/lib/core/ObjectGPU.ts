import Renderer from "../Renderer";
import MathUtils from "../MathUtils";

export default class ObjectGPU {
    public label: string;
    public renderer: Renderer;
    public UUID: string;

    constructor(renderer: Renderer, label = "") {
        this.renderer = renderer;
        this.label = label;
        this.UUID = MathUtils.generateUUID();
    }

    get device(): GPUDevice {
        return this.renderer.device;
    }
}

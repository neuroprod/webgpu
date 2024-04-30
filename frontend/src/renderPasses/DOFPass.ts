import Renderer from "../lib/Renderer";
import DOFRenderPass from "./DOFRenderPass";

export default class DOFPass {
    private renderer: Renderer;
    private horizontalPass: DOFRenderPass;
    private verticalPass: DOFRenderPass;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.horizontalPass = new DOFRenderPass(this.renderer, "DOFH");
        this.verticalPass = new DOFRenderPass(this.renderer, "DOF");
    }

    public init() {
        this.horizontalPass.init(true, "CombinePass")
        this.verticalPass.init(false, "DOFH")
    }

    add() {
        this.horizontalPass.add()
        this.verticalPass.add()
    }

}

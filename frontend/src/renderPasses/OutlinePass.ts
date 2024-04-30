import Renderer from "../lib/Renderer";
import OutlinePrePass from "./OutlinePrePass";
import Model from "../lib/model/Model";
import OutlineBlurPass from "./OutlineBlurPass";
import Timer from "../lib/Timer";


export default class OutlinePass {
    private renderer: Renderer;
    private outlinePrePass: OutlinePrePass;
    private horizontalPass: OutlineBlurPass;
    private verticalPass: OutlineBlurPass;
    private noHitCount: number;
    private setFrame: number;


    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.outlinePrePass = new OutlinePrePass(renderer)
        this.horizontalPass = new OutlineBlurPass(renderer, "outlineBlurH")
        this.verticalPass = new OutlineBlurPass(renderer, "OutlineBlur")
    }

    public init() {
        this.horizontalPass.init(true, "OutlinePrePass")
        this.verticalPass.init(false, "outlineBlurH")
    }

    public setModel(m: Model | null) {

        if (m) {
            this.setFrame = Timer.frame;
            this.outlinePrePass.models = [m]
            this.outlinePrePass.models = this.outlinePrePass.models.concat(m.hitFriends)
            for (let m of this.outlinePrePass.models) {

                m.materialSolid.uniforms.setTexture("gDepth", this.renderer.texturesByLabel['GDepth']);
            }

            this.noHitCount = 1000000000;
        } else {
            if (this.setFrame == Timer.frame) return;
            this.outlinePrePass.models = [];

            if (this.noHitCount > 5) this.noHitCount = 5;

        }
    }

    add() {
        if (this.noHitCount < 0) {

            // return;
        }


        this.noHitCount--;
        this.outlinePrePass.add();
        this.horizontalPass.add();
        this.verticalPass.add();
    }
}

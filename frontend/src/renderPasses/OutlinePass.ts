import Renderer from "../lib/Renderer";
import OutlinePrePass from "./OutlinePrePass";
import Model from "../lib/model/Model";
import OutlineBlurPass from "./OutlineBlurPass";


export default class OutlinePass {
    private renderer: Renderer;
    private outlinePrePass: OutlinePrePass;
    private horizontalPass: OutlineBlurPass;
    private verticalPass: OutlineBlurPass;
    private noHitCount: number;


    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.outlinePrePass =new OutlinePrePass(renderer)
        this.horizontalPass =new OutlineBlurPass(renderer,"outlineBlurH")
        this.verticalPass =new OutlineBlurPass(renderer,"OutlineBlur")
    }
    public init()
    {
        this.horizontalPass.init(true,"OutlinePrePass")
        this.verticalPass.init(false,"outlineBlurH")
    }
    public setModel(m:Model|null)
    {

        if(m){
            this.outlinePrePass.models=[m]
            this.outlinePrePass.models = this.outlinePrePass.models.concat(m.hitFriends)
            this.noHitCount =0;
        }else{
            this.outlinePrePass.models=[];
            this.noHitCount ++

        }
    }
    add(){
        //if( this.noHitCount>1 )return;
        this.outlinePrePass.add();
        this.horizontalPass.add();
        this.verticalPass.add();
    }
}

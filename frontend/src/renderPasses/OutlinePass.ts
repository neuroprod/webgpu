import Renderer from "../lib/Renderer";
import OutlinePrePass from "./OutlinePrePass";
import Model from "../lib/model/Model";


export default class OutlinePass {
    private renderer: Renderer;
    private outlinePrePass: OutlinePrePass;


    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.outlinePrePass =new OutlinePrePass(renderer)
    }
    public setModel(m:Model|null)
    {

        if(m){
            this.outlinePrePass.models=[m]
        }else{
            this.outlinePrePass.models=[];
        }
    }
    add(){
        this.outlinePrePass.add();
    }
}

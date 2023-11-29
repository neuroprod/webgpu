import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";

import GLFTLoader from "./GLFTLoader";
import ModelRenderer from "./lib/model/ModelRenderer";
import Object3D from "./lib/core/Object3D";
import UI from "./lib/UI/UI";


export default class Outside{
    private renderer: Renderer;
    private glFTLoader: GLFTLoader;
    modelRenderer: ModelRenderer;
    modelRendererTrans: ModelRenderer;

    constructor(renderer:Renderer,preloader:PreLoader) {

        this.renderer=renderer;
        this.glFTLoader = new GLFTLoader(this.renderer, "outside", preloader);

    }
    init(){
        this.modelRenderer =new ModelRenderer(this.renderer,"outside");
        this.modelRendererTrans =new ModelRenderer(this.renderer,"outsideTrans");





        for (let m of this.glFTLoader.models) {
            this.modelRenderer.addModel(m)

        }
    }
    addCharacter(charRoot:Object3D){

    }
    public update(){
       
        this.glFTLoader.root.setPosition(this.renderer.ratio * 4 / 2+UI.LFloat('offset'), -1.5, 0)
    }
}

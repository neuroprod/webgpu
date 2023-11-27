import Renderer from "../Renderer";
import ModelRenderer from "../model/ModelRenderer";
import Object3D from "../core/Object3D";
import GBufferShader from "../../shaders/GBufferShader";
import Box from "../meshes/Box";
import GBufferShaderNormal from "../../shaders/GbufferShaderNormal";
import Model from "../model/Model";
import Material from "../core/Material";

export default class TransformDebugger {
    debugString = "";
    private renderer: Renderer;
    private modelRenderer: ModelRenderer;
    private mainShader: GBufferShader;
    private mesh: Box;

    constructor(renderer: Renderer, modelrenderer: ModelRenderer, rootTransform: Object3D) {
      //  console.log(rootTransform)
        this.renderer  =renderer;
        this.modelRenderer =modelrenderer;
        this.mainShader = new GBufferShaderNormal(this.renderer, "gBufferShaderNormal");

        this.mesh = new Box(this.renderer, {width : 5,height  : 10,depth:5})

        this.add(rootTransform, 0);
       console.log(this.debugString)
    }


    private add(obj: Object3D, depth = 0) {



        let s = ""
        for (let i = 0; i < depth; i++) s += " ";
        s += "-" + obj.label +" "+obj.getScale()+"" +obj.getWorldPos();
        s += "\n";
        this.debugString += s;
        depth++;
        for (let c of obj.children) {
            this.add(c,depth);
        }
        if(depth!=0){
        let m =new Model(this.renderer,obj.label+"test");
        m.castShadow =true;
        m.material =new Material(this.renderer,"test",this.mainShader);

        m.mesh =this.mesh;

        obj.addChild(m);
        this.modelRenderer.addModel(m)
        }
    }
}

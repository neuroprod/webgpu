
import Renderer from "../Renderer";
import Material from "../core/Material";
import Mesh from "../core/Mesh";
import Object3D from "../core/Object3D";
import ModelTransform from "./ModelTransform";


export default class Model extends Object3D
{
    material!: Material;
    mesh!:Mesh

   public modelTransform: ModelTransform;
    constructor(renderer:Renderer,label:string) {
        super(renderer,label);
        this.modelTransform =new ModelTransform(renderer,label+"_transform")

        this.renderer.addModel(this);
    }
    public update()
    {
        if(!this._dirty)return;
            this.updateMatrices()

    }
    protected updateMatrices(){
        super.updateMatrices();

        this.modelTransform.setWorldMatrix(this.worldMatrix);
    }

}

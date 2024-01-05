import Renderer from "../Renderer";
import Material from "../core/Material";
import Mesh from "../core/Mesh";
import Object3D from "../core/Object3D";
import ModelTransform from "./ModelTransform";
import HitTestObject from "../meshes/HitTestObject";
import Ray from "../Ray";
import GameModel from "../../GameModel";
import UI from "../UI/UI";


export default class Model extends Object3D {
    material!: Material;
    mesh!: Mesh

    public modelTransform: ModelTransform;
    public visible: boolean = true;
    public hitTestObject: HitTestObject;
    public canHitTest: boolean = false;
    public needsHitTest:boolean =false;
    public needsAlphaClip:boolean =false;
    public needsWind:boolean =false;
    public hitFriends:Array<Model>=[];
    normalAdj: number =0;
    public castShadow :boolean=true;
    constructor(renderer: Renderer, label: string) {
        super(renderer, label);
        this.modelTransform = new ModelTransform(renderer, label + "_transform")
        this.buttonGroupSetting.color.setHex("#b32512")
        this.renderer.addModel(this);
    }

    public update() {
        if (!this._dirty) return;
        this.updateMatrices()

    }

    public checkHit(ray: Ray) {

        if(this.hitTestObject.checkHit(ray, this.worldMatrixInv)){


            return true;
        }
        return false;
    }
    onDataUI() {
        super.onDataUI();
        this.needsHitTest =UI.LBool("needs HitTest",this.needsHitTest)
        this.needsAlphaClip =UI.LBool("needs AlphaClip", this.needsAlphaClip)
        this.visible =UI.LBool("visible", this.visible)

        this.castShadow=UI.LBool("castShadow",  this.castShadow)


        this.needsWind =UI.LBool("wind", this.needsWind)
        this.normalAdj =UI.LFloatSlider("normalAdj",0,0,2)
    }

    destroy() {
        if (this.parent) this.parent.removeChild(this);
    }

    protected updateMatrices() {
        super.updateMatrices();

        this.modelTransform.setWorldMatrix(this.worldMatrix);
    }

    saveData(data:any) {

        data[this.mesh.label]={
            needsHitTest :this.needsHitTest,
            needsAlphaClip:this.needsAlphaClip,
            visible:this.visible,
            needsWind:this.needsWind,
            castShadow:this.castShadow,
            normalAdj:this.normalAdj,

        }

    }
}

import Renderer from "../Renderer";
import Material from "../core/Material";
import Mesh from "../core/Mesh";
import Object3D from "../core/Object3D";
import ModelTransform from "./ModelTransform";
import HitTestObject from "../meshes/HitTestObject";
import Ray from "../Ray";

import UI from "../UI/UI";
import {Vector3} from "math.gl";


export default class Model extends Object3D {
    material!: Material;
    shadowMaterial!: Material;
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
    public min:Vector3 =new Vector3()
    public max:Vector3 =new Vector3()
    public center:Vector3 =new Vector3()
    public radius =1;
    private keepAlive: boolean;

    constructor(renderer: Renderer, label: string,keepAlive:boolean=true) {
        super(renderer, label);
        this.modelTransform = new ModelTransform(renderer, label + "_transform")
        this.buttonGroupSetting.color.setHex("#b32512")
        this.keepAlive =keepAlive;
        if(keepAlive)
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

        UI.LText(this.center+"/"+this.radius,"sphere");

    }

    destroy() {
        if(this.keepAlive) this.renderer.removeModel(this);
        if(this.mesh)this.mesh.destroy();

        if (this.parent) this.parent.removeChild(this);
    }

    protected updateMatrices() {
        super.updateMatrices();
        if(this.mesh) {
            this.min.from(this.mesh.min)
            this.max.from(this.mesh.max)
            this.min.transform(this.worldMatrix)
            this.max.transform(this.worldMatrix)
            this.center.from(this.min)
            this.center.add(this.max)
            this.center.scale(0.5);

            this.radius = this.center.distance(this.max);
        }
        this.modelTransform.setWorldMatrix(this.worldMatrix);
    }

    saveData(data:any) {
if(!this.mesh)return;

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

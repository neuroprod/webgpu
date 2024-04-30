import Renderer from "../Renderer";
import Material from "../core/Material";
import Mesh from "../core/Mesh";
import Object3D from "../core/Object3D";
import ModelTransform from "./ModelTransform";
import HitTestObject from "../meshes/HitTestObject";
import Ray from "../Ray";

import UI from "../UI/UI";
import {Vector3, Vector4} from "math.gl";


export default class Model extends Object3D {
    material!: Material;
    shadowMaterial!: Material;
    mesh!: Mesh

    public modelTransform: ModelTransform;
    public visible: boolean = true;
    public hitTestObject: HitTestObject;
    public enableHitTest: boolean = true;
    public needsHitTest: boolean = false;
    public needsAlphaClip: boolean = false;
    public needsWind: boolean = false;
    public hitFriends: Array<Model> = [];
    normalAdj: number = 0;
    public castShadow: boolean = true;
    public min: Vector3 = new Vector3()
    public max: Vector3 = new Vector3()
    public center: Vector3 = new Vector3()
    public radius = 1;
    private keepAlive: boolean;
    alphaClipValue = 0;
    public needCulling: boolean = true;
    public windData: Vector4 = new Vector4(0, 1, 0.5, 0.2)
    numInstances: number = 1;
    hitLabel: string = "";
    materialSolid: Material;

    constructor(renderer: Renderer, label: string, keepAlive: boolean = true) {
        super(renderer, label);
        this.modelTransform = new ModelTransform(renderer, label + "_transform")
        this.buttonGroupSetting.color.setHex("#b32512")
        this.keepAlive = keepAlive;
        if (keepAlive) this.renderer.addModel(this);
    }

    public update() {
        if (!this._dirty) return;
        if (!this.visible && !this.enableHitTest) return;
        this.updateMatrices()

    }

    public checkHit(ray: Ray) {
        if (!this.enableHitTest) return false;

        if (this.hitTestObject.checkHit(ray, this.worldMatrixInv)) {


            return true;
        }
        return false;
    }

    onDataUI() {
        super.onDataUI();
        this.needsHitTest = UI.LBool("needs HitTest", this.needsHitTest)
        this.needsAlphaClip = UI.LBool("needs AlphaClip", this.needsAlphaClip)
        this.alphaClipValue = UI.LFloatSlider("alphaClipValue", this.alphaClipValue, 0, 1)
        this.visible = UI.LBool("visible", this.visible)
        this.needCulling = UI.LBool("needCulling", this.needCulling);
        this.castShadow = UI.LBool("castShadow", this.castShadow)


        this.needsWind = UI.LBool("wind", this.needsWind)

        UI.LVector("windData", this.windData)


        this.normalAdj = UI.LFloatSlider("normalAdj", this.normalAdj, 0, 2)
        this.material.uniforms.setUniform("normalAdj", this.normalAdj)
        UI.LText(this.center + "/" + this.radius, "sphere");
        try {
            if (this.needsAlphaClip) {
                this.material.uniforms.setUniform("alphaClipValue", this.alphaClipValue)
                if (this.castShadow) {
                    this.shadowMaterial.uniforms.setUniform("alphaClipValue", this.alphaClipValue)

                }
            }
            if (this.needsWind) {
                this.material.uniforms.setUniform("windData", this.windData)
                if (this.castShadow && this.shadowMaterial.uniforms) {
                    this.shadowMaterial.uniforms.setUniform("windData", this.windData)

                }
            }
        } catch (e) {
        }
    }

    destroy() {

        if (this.keepAlive) this.renderer.removeModel(this);
        if (this.mesh) this.mesh.destroy();

        if (this.parent) this.parent.removeChild(this);
    }

    protected updateMatrices() {
        super.updateMatrices();
        if (this.mesh) {
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

    saveData(data: any) {
        if (!this.mesh) return;

        data[this.mesh.label] = {
            needsHitTest: this.needsHitTest,
            needsAlphaClip: this.needsAlphaClip,
            visible: this.visible,
            needsWind: this.needsWind,
            windData: this.windData,
            castShadow: this.castShadow,
            normalAdj: this.normalAdj,
            alphaClipValue: this.alphaClipValue,
            needCulling: this.needCulling,
        }

    }

    public buffersByName: { [name: string]: GPUBuffer } = {};

    addBuffer(name, GPUbuffer) {
        this.buffersByName[name] = GPUbuffer;
    }

    getBufferByName(name: string) {
        return this.buffersByName[name];
    }
}

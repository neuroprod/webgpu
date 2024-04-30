import Renderer from "../lib/Renderer";
import ModelRenderer from "../lib/model/ModelRenderer";
import UI from "../lib/UI/UI";
import {Vector3, Vector4} from "math.gl";
import KawaseDownShader from "../shaders/KawaseDownShader";
import Sphere from "../lib/meshes/Sphere";
import Material from "../lib/core/Material";
import Model from "../lib/model/Model";
import ColorV from "../lib/ColorV";
import LightMeshShader from "../shaders/LightMeshShader";
import LightShader from "../shaders/LightShader";
import Object3D from "../lib/core/Object3D";
import SelectItem from "../lib/UI/math/SelectItem";


export default class PointLight extends Object3D {
    private modelRenderer: ModelRenderer;

    public castShadow: boolean = false
    private mesh: Sphere;
    private shader: KawaseDownShader;
    private material: Material;
    public model: Model;

    private shaderMesh: LightMeshShader;
    private materialMesh: Material;
    private modelMesh: Model;


    private size = 2;

    private color: ColorV = new ColorV(1, 1, 1, 1)
    private strength: number = 10;

    private numShadowSamples: number = 2;
    private shadowScale: number = 1;

    private sizeMesh = 0.05;
    private showLightMesh: boolean = true;
    private maxDistance: number = 0.5;
    private lightParents: Array<Object3D>;
    private parentIndex = 0;
    private lightPos: Vector3 = new Vector3(0, 0, 0)
    private parentSelect: Array<SelectItem> = []

    constructor(renderer: Renderer, label: string, modelRenderer: ModelRenderer, data: any = null, lightParents: Array<Object3D>) {

        super(renderer, label)

        this.lightParents = lightParents;
        for (let i = 0; i < lightParents.length; i++) {
            this.parentSelect.push(new SelectItem(lightParents[i].label, i))
        }
        this.modelRenderer = modelRenderer;
        if (data) {
            this.label = data.label;
            this.setPosition(data.position[0], data.position[1], data.position[2]);
            this.lightPos.set(data.position[0], data.position[1], data.position[2]);
            this.size = data.size;
            this.color.set(data.color[0], data.color[1], data.color[2], data.color[3]);
            this.parentIndex = data.parentIndex;
            this.strength = data.strength;
            this.castShadow = data.castShadow;
            this.numShadowSamples = data.numShadowSamples;
            this.shadowScale = data.shadowScale;
            this.sizeMesh = data.sizeMesh;
            this.showLightMesh = data.showLightMesh;
        }
        if (this.parentIndex >= 0)
            lightParents[this.parentIndex].addChild(this)


        this.mesh = new Sphere(renderer, 1, 16, 8);


        this.shader = new LightShader(renderer, "lightShader");
        this.material = new Material(renderer, "light", this.shader)
        this.material.depthWrite = false;
        this.material.blendModes = [
            {
                color: {
                    srcFactor: "one",
                    dstFactor: "one",
                    operation: "add",
                },
                alpha: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                },
            }

        ]
        this.model = new Model(renderer, "light");

        this.model.setScale(this.size, this.size, this.size)
        this.model.material = this.material;
        this.model.mesh = this.mesh;

        this.material.uniforms.setUniform("shadow", new Vector4(this.castShadow ? 1 : 0, this.numShadowSamples, this.shadowScale, this.maxDistance))
        let world = this.getWorldPos()
        this.material.uniforms.setUniform("position", new Vector4(world.x, world.y, world.z, this.size))
        this.material.uniforms.setUniform("color", new Vector4(this.color.x, this.color.y, this.color.z, this.strength))
        this.material.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"])
        this.material.uniforms.setTexture("gNormal", this.renderer.texturesByLabel["GNormal"])
        this.material.uniforms.setTexture("gMRA", this.renderer.texturesByLabel["GMRA"])
        this.material.uniforms.setTexture("gColor", this.renderer.texturesByLabel["GColor"])
        this.material.uniforms.setTexture("ao", this.renderer.texturesByLabel["GTAOdenoise"])
        modelRenderer.addModel(this.model)


        this.shaderMesh = new LightMeshShader(renderer, "lightMeshShader");
        this.materialMesh = new Material(renderer, "lightMesh", this.shaderMesh)
        this.materialMesh.depthWrite = false;
        this.materialMesh.blendModes = [
            {
                color: {
                    srcFactor: "one",
                    dstFactor: "one",
                    operation: "add",
                },
                alpha: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                },
            }

        ]
        this.modelMesh = new Model(renderer, "lightMesh");

        this.modelMesh.setScale(this.sizeMesh, this.sizeMesh, this.sizeMesh)
        this.modelMesh.material = this.materialMesh;
        this.modelMesh.mesh = this.mesh;
        this.modelMesh.visible = this.showLightMesh;
        modelRenderer.addModel(this.modelMesh)

        this.addChild(this.model)
        this.addChild(this.modelMesh)

    }

    setStrength(value: number) {
        if (value == 0) {
            this.model.visible = false
            return
        }
        this.model.visible = true
        this.strength = value;
        //  this.material.uniforms.setUniform("color", new Vector4(this.color.x, this.color.y, this.color.z, this.strength*value))
    }

    getData(): any {
        let data = {
            label: this.label,
            position: this.lightPos,
            size: this.size,
            color: this.color,
            strength: this.strength,
            castShadow: this.castShadow,
            numShadowSamples: this.numShadowSamples,
            shadowScale: this.shadowScale,
            sizeMesh: this.sizeMesh,
            showLightMesh: this.showLightMesh,
            parentIndex: this.parentIndex,
        }
        return data

    }

    onDataUI() {
        UI.pushID(this.UUID + "");
        UI.separator(this.label)
        UI.setIndent(20)
        this.label = UI.LTextInput("name", this.label);
        // UI.LVector("Position", this.position);
        UI.LVector("position", this.lightPos)
        this.setPosition(this.lightPos.x, this.lightPos.y, this.lightPos.z);
        let value = UI.LSelect("parent", this.parentSelect, this.parentIndex)
        if (value != this.parentIndex) {
            this.parentIndex = value;
            this.lightParents[this.parentIndex].addChild(this);
        }


        this.size = UI.LFloatSlider("Size", this.size, 0.1, 4);
        UI.LColor("color", this.color)
        this.strength = UI.LFloatSlider("strength", this.strength, 0, 5);

        this.castShadow = UI.LBool("Contact Shadow", this.castShadow)
        if (this.castShadow) {
            UI.setIndent(40)

            this.numShadowSamples = Math.round(UI.LFloatSlider("numSamples", this.numShadowSamples, 1, 50));
            this.shadowScale = UI.LFloatSlider("scale", this.shadowScale, 0, 1);
            this.maxDistance = UI.LFloatSlider("maxDistance", this.maxDistance, 0, 1);
        }
        this.showLightMesh = UI.LBool("Show Light mesh", this.showLightMesh)
        if (this.showLightMesh) {
            UI.setIndent(40)
            this.sizeMesh = UI.LFloatSlider("MeshSize", this.sizeMesh, 0, 1);
        }
        UI.setIndent(0)
        UI.popID();
        this.material.uniforms.setUniform("shadow", new Vector4(this.castShadow ? 1 : 0, this.numShadowSamples, this.shadowScale, this.maxDistance))
        this.material.uniforms.setUniform("color", new Vector4(this.color.x, this.color.y, this.color.z, this.strength))
        let world = this.getWorldPos()
        this.material.uniforms.setUniform("position", new Vector4(world.x, world.y, world.z, this.size))
        // this.model.setPosition(this.position.x, this.position.y, this.position.z)
        this.model.setScale(this.size, this.size, this.size)


        this.materialMesh.uniforms.setUniform("color", new Vector4(this.color.x, this.color.y, this.color.z, this.strength))
        //this.modelMesh.setPosition(this.position.x, this.position.y, this.position.z)
        this.modelMesh.setScale(this.sizeMesh, this.sizeMesh, this.sizeMesh)
        this.modelMesh.visible = this.showLightMesh;

    }

    destroy() {
        this.mesh.destroy();
        this.lightParents[this.parentIndex].removeChild(this);
        this.modelRenderer.removeModel(this.modelMesh);
        this.modelRenderer.removeModel(this.model);
        this.model.destroy();
        this.modelMesh.destroy();
    }


    update() {

        this.material.uniforms.setUniform("color", new Vector4(this.color.x, this.color.y, this.color.z, this.strength))
        let world = this.getWorldPos()
        this.material.uniforms.setUniform("position", new Vector4(world.x, world.y, world.z, this.size))
    }


}

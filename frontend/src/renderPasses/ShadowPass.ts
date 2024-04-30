import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import {TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";
import RenderPass from "../lib/core/RenderPass";
import Renderer from "../lib/Renderer";
import ModelRenderer from "../lib/model/ModelRenderer";
import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import DepthShader from "../shaders/DepthShader";
import DepthSkinShader from "../shaders/DepthSkinShader";
import Camera from "../lib/Camera";
import {Vector3} from "math.gl";
import UI from "../lib/UI/UI";
import GameModel from "../../public/GameModel";


export default class ShadowPass extends RenderPass {

    public modelRenderer: ModelRenderer;
    public camera: any;
    models: Array<Model>;
    private material: Material;
    private materialSkin: Material;
    private depthTarget: RenderTexture;
    private colorTarget: RenderTexture;
    private colorAttachment: ColorAttachment;
    private id: number;


    setModels(models: Array<Model>) {
        this.models = models;
    }

    constructor(renderer: Renderer, id: number) {

        super(renderer, "ShadowPass");
        this.id = id;
        let sizeW = 1024 * 2;
        let sizeH = 1024 * 2;
        this.depthTarget = new RenderTexture(renderer, "Shadow" + id, {
            format: TextureFormat.Depth16Unorm,
            sampleCount: 1,
            scaleToCanvas: false,
            width: sizeW,
            height: sizeH,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthTarget.make()
        this.depthStencilAttachment = new DepthStencilAttachment(this.depthTarget);
        this.depthStencilAttachment.getAttachment()


        this.colorTarget = new RenderTexture(renderer, "ShadowColor" + id, {
            format: TextureFormat.R16Float,
            sampleCount: 1,
            scaleToCanvas: false,
            width: sizeW,
            height: sizeH,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorTarget.make()
        this.colorAttachment = new ColorAttachment(this.colorTarget);
        this.colorAttachment.getAttachment();
        this.colorAttachments = [this.colorAttachment];

    }

    init() {
        this.material = new Material(this.renderer, "shadow", new DepthShader(this.renderer, "depthShader"))
        if (this.renderer.skin) {
            this.materialSkin = new Material(this.renderer, "shadowSkin", new DepthSkinShader(this.renderer, "depthSkinShader"))
            this.materialSkin.skin = this.renderer.skin;
        }

        this.camera = new Camera(this.renderer, "cameraShadow" + this.id);

        this.camera.perspective = false;
        this.camera.cameraWorld = new Vector3(1, 2, 1);
        this.camera.cameraLookAt = new Vector3(0, 0, 0);

        this.camera.orthoLeft = -13;
        this.camera.orthoRight = 2;
        this.camera.orthoBottom = -10;
        this.camera.orthoTop = 6;
        this.camera.near = -21;
        this.camera.far = 35;

        if (this.id == 2) {
            this.camera.orthoTop = 18;
            this.camera.orthoLeft -= 10;
            this.camera.orthoRight += 10;
        }
    }

    public update(dir: Vector3, camPos: number) {

        this.camera.cameraLookAt = new Vector3(5, 0, -10)
        this.camera.cameraWorld = this.camera.cameraLookAt.clone().add(dir.clone().scale(-20))
        this.camera.cameraWorld.x += camPos;
        this.camera.cameraLookAt.x += camPos;
    }

    onUI() {
        UI.pushGroup("shadowCam" + this.id);
        this.camera.onUI();
        UI.popGroup();
    }

    draw() {


        const passEncoder = this.passEncoder;

        passEncoder.setBindGroup(0, this.camera.bindGroup);


        for (let model of this.models) {
            if (!model.visible) continue
            if (!model.castShadow) continue
            if (!this.camera.modelInFrustum(model)) continue;

            if (!model.shadowMaterial) continue
            GameModel.drawCount++;
            model.shadowMaterial.makePipeLine(this);
            passEncoder.setPipeline(model.shadowMaterial.pipeLine);
            passEncoder.setBindGroup(1, model.modelTransform.bindGroup);

            if (model.material.skin != undefined) {
                if (this.id == 2) continue;//?

                passEncoder.setBindGroup(2, model.material.skin.bindGroup);
                for (let attribute of model.shadowMaterial.shader.attributes) {
                    passEncoder.setVertexBuffer(
                        attribute.slot,
                        model.mesh.getBufferByName(attribute.name)
                    );
                }
            } else {

                if (model.shadowMaterial.uniforms) {
                    passEncoder.setBindGroup(2, model.shadowMaterial.uniforms.bindGroup);
                }
                for (let attribute of model.shadowMaterial.shader.attributes) {
                    passEncoder.setVertexBuffer(
                        attribute.slot,
                        model.mesh.getBufferByName(attribute.name)
                    );
                }
            }


            if (model.mesh.hasIndices) {

                passEncoder.setIndexBuffer(model.mesh.indexBuffer, model.mesh.indexFormat);
                passEncoder.drawIndexed(
                    model.mesh.numIndices,
                    1,
                    0,
                    0
                );
            } else {
                passEncoder.draw(
                    model.mesh.numVertices,
                    1,
                    0,
                    0
                );
            }

        }


    }

}

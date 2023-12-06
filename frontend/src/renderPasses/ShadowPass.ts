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



export default class ShadowPass extends RenderPass {

    public modelRenderer: ModelRenderer;
    public camera: any;
    models: Array<Model>;
    private material: Material;
    private materialSkin: Material;
    private depthTarget: RenderTexture;




    setModels(models:Array<Model>){
        this.models =models;
    }

    constructor(renderer: Renderer) {

        super(renderer, "ShadowPass");

        this.depthTarget = new RenderTexture(renderer, "Shadow", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: 1,
            scaleToCanvas: false,
            width:2048,
            height:2048,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthTarget.make()



        this.depthStencilAttachment = new DepthStencilAttachment(   this.depthTarget);

      this.depthStencilAttachment.getAttachment()


    }
    init(){
        this.material =new Material(this.renderer,"shadow",new DepthShader(this.renderer,"depthShader"))
        if(this.renderer.skin) {
            this.materialSkin = new Material(this.renderer, "shadowSkin", new DepthSkinShader(this.renderer, "depthSkinShader"))
             this.materialSkin.skin = this.renderer.skin;
        }

        this.camera =new Camera(this.renderer,"cameraShadow");

        this.camera.perspective =false;
        this.camera.cameraWorld =new Vector3(1,2,1);
        this.camera.cameraLookAt =new Vector3(0,0,0);

        this.camera.orthoLeft =-25.76;
        this.camera.orthoRight =9;
        this.camera.orthoBottom =-10;
        this.camera.orthoTop =18;
        this.camera.near =-13;
        this.camera.far =35;
    }
    public update(dir:Vector3,camPos:number){

        this.camera.cameraLookAt =new Vector3(5,0,-10)
        this.camera.cameraWorld =this.camera.cameraLookAt.clone().add(dir.clone().scale(-20))
        this.camera.cameraWorld.x +=camPos;
        this.camera.cameraLookAt.x +=camPos;
    }
    onUI()
    {
        UI.pushWindow("shadowCam");
this.camera.onUI();
        UI.popWindow();
    }
    draw() {

        const passEncoder =this.passEncoder;

        passEncoder.setBindGroup(0,this.camera.bindGroup);
        this.material.makePipeLine(this);
        this.materialSkin.makePipeLine(this);
        //passEncoder.setPipeline(this.material.pipeLine);

        for (let model of this.models) {
            if(!model.visible)continue
            if(!model.castShadow)continue

            passEncoder.setBindGroup(1,model.modelTransform.bindGroup);
            if(model.material.skin != undefined){
                passEncoder.setPipeline(this.materialSkin.pipeLine);
                passEncoder.setBindGroup(2,model.material.skin.bindGroup);
                for (let attribute of this.materialSkin.shader.attributes) {
                    passEncoder.setVertexBuffer(
                        attribute.slot,
                        model.mesh.getBufferByName(attribute.name)
                    );
                }
            }else{
                passEncoder.setPipeline(this.material.pipeLine);
                for (let attribute of this.material.shader.attributes) {
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

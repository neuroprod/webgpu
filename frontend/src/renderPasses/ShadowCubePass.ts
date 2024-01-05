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



export default class ShadowCubePass extends RenderPass {

    public modelRenderer: ModelRenderer;
    private camera: any;
    models: Array<Model>;
    private material: Material;
    private materialSkin: Material;






    constructor(renderer: Renderer,depthTexture:RenderTexture,index:number,camera,colorTexture:RenderTexture) {

        super(renderer, "ShadowCubePass");

       this.material =new Material(this.renderer,"shadowCube",new DepthShader(this.renderer,"depthShader"))
       if(this.renderer.skin) {
           this.materialSkin = new Material(this.renderer, "shadowCubeSkin", new DepthSkinShader(this.renderer, "depthSkinShader"))
           this.materialSkin.skin = this.renderer.skin;

       }
       this.colorAttachments =[new ColorAttachment(colorTexture,{arrayLayerCount:1,baseArrayLayer:index})];
        this.depthStencilAttachment = new DepthStencilAttachment(depthTexture,{arrayLayerCount:1,baseArrayLayer:index});
        this.camera =camera;
        this.colorAttachments[0].getAttachment()
        this.depthStencilAttachment.getAttachment()
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
           if(!this.camera.modelInFrustum(model))continue;

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

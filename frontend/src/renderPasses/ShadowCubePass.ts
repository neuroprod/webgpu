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



export default class ShadowCubePass extends RenderPass {

    public modelRenderer: ModelRenderer;
    private camera: any;
    models: Array<Model>;
    private material: Material;






    constructor(renderer: Renderer,depthTexture:RenderTexture,index:number,camera,colorTexture:RenderTexture) {

        super(renderer, "ShadowCubePass");

       this.material =new Material(this.renderer,"shadowCube",new DepthShader(this.renderer,"depthshader"))


        this.colorAttachments =[new ColorAttachment(colorTexture,{arrayLayerCount:1,baseArrayLayer:index})];
        this.depthStencilAttachment = new DepthStencilAttachment(depthTexture,{arrayLayerCount:1,baseArrayLayer:index});
        this.camera =camera;


    }

    draw() {

       const passEncoder =this.passEncoder;

        passEncoder.setBindGroup(0,this.camera.bindGroup);
        this.material.makePipeLine(this);

        passEncoder.setPipeline(this.material.pipeLine);

        for (let model of this.models) {
            if(!model.visible)continue


            passEncoder.setBindGroup(1,model.modelTransform.bindGroup);



            for (let attribute of this.material.shader.attributes) {
                passEncoder.setVertexBuffer(
                    attribute.slot,
                    model.mesh.getBufferByName(attribute.name)
                );
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

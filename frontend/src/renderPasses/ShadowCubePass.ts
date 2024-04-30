import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";

import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";
import RenderPass from "../lib/core/RenderPass";
import Renderer from "../lib/Renderer";
import ModelRenderer from "../lib/model/ModelRenderer";
import Model from "../lib/model/Model";

import Camera from "../lib/Camera";
import GameModel from "../../public/GameModel";


export default class ShadowCubePass extends RenderPass {

    public modelRenderer: ModelRenderer;
    public camera: Camera;
    models: Array<Model> = [];


    constructor(renderer: Renderer, depthTexture: RenderTexture, index: number, camera, colorTexture: RenderTexture) {

        super(renderer, "ShadowCubePass");


        this.colorAttachments = [new ColorAttachment(colorTexture, {
            arrayLayerCount: 1,
            baseArrayLayer: index,
            clearValue: {r: 1000, g: 1000, b: 1000, a: 0}
        })];
        this.depthStencilAttachment = new DepthStencilAttachment(depthTexture, {
            arrayLayerCount: 1,
            baseArrayLayer: index
        });
        this.camera = camera;
        this.colorAttachments[0].getAttachment()
        this.depthStencilAttachment.getAttachment()
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

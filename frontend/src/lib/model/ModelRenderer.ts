import Model from "./Model";
import RenderPass from "../core/RenderPass";
import Renderer from "../Renderer";
import GameModel from "../../../public/GameModel";

export default class ModelRenderer {

    public models: Array<Model> = [];
    private renderer: Renderer;
    private label: string;

    constructor(renderer: Renderer, label = "") {
        this.label = label;
        this.renderer = renderer;

    }

    draw(pass: RenderPass) {
        const passEncoder = pass.passEncoder;

        passEncoder.setBindGroup(0, this.renderer.camera.bindGroup);

        for (let model of this.models) {
            if (!model.visible) continue
            if (!this.renderer.camera.modelInFrustum(model)) continue;

            GameModel.drawCount++;
            model.material.makePipeLine(pass);

            passEncoder.setPipeline(model.material.pipeLine);
            passEncoder.setBindGroup(1, model.modelTransform.bindGroup);
            if (model.material.uniforms) {
                passEncoder.setBindGroup(2, model.material.uniforms.bindGroup);
            }
            if (model.material.skin) {
                passEncoder.setBindGroup(3, model.material.skin.bindGroup);
            }

            for (let attribute of model.material.shader.attributes) {
                let buffer = model.mesh.getBufferByName(attribute.name);
                if (!buffer) buffer = model.getBufferByName(attribute.name);
                if (buffer) {
                    passEncoder.setVertexBuffer(
                        attribute.slot,
                        buffer,
                    )
                } else {

                    console.log("buffer not found", attribute.name)
                }
            }

            if (model.mesh.hasIndices) {

                passEncoder.setIndexBuffer(model.mesh.indexBuffer, model.mesh.indexFormat);
                passEncoder.drawIndexed(
                    model.mesh.numIndices,
                    model.numInstances,
                    0,
                    0
                );
            } else {
                passEncoder.draw(
                    model.mesh.numVertices,
                    model.numInstances,
                    0,
                    0
                );
            }

        }
    }

    public addModel(model: Model) {

        this.models.push(model);
    }

    removeModel(model: Model) {
        const index = this.models.indexOf(model, 0);
        if (index > -1) {
            this.models.splice(index, 1);
        }
    }
}

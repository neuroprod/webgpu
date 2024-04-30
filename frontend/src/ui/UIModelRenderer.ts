import Model from "../lib/model/Model";
import RenderPass from "../lib/core/RenderPass";
import Renderer from "../lib/Renderer";
import Camera from "../lib/Camera";

export default class UIModelRenderer {

    public models: Array<Model> = [];
    private renderer: Renderer;
    private label: string;
    camera: Camera;

    constructor(renderer: Renderer, label = "") {
        this.label = label;
        this.renderer = renderer;

    }

    draw(pass: RenderPass) {
        const passEncoder = pass.passEncoder;

        passEncoder.setBindGroup(0, this.camera.bindGroup);
        //  passEncoder.setBindGroup(0,this.renderer.bindGroup);
        for (let model of this.models) {
            if (!model.visible) continue;
            if (!model.mesh) continue;

            model.material.makePipeLine(pass);

            passEncoder.setPipeline(model.material.pipeLine);
            passEncoder.setBindGroup(1, model.modelTransform.bindGroup);
            passEncoder.setBindGroup(2, model.material.uniforms.bindGroup);


            for (let attribute of model.material.shader.attributes) {
                let buffer = model.mesh.getBufferByName(attribute.name);
                if (buffer) {
                    passEncoder.setVertexBuffer(
                        attribute.slot,
                        buffer,
                    );
                } else {
                    console.log("buffer not found", attribute.name)
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

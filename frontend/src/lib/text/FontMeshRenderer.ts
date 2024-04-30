import Renderer from "../Renderer";
import RenderPass from "../core/RenderPass";
import Model from "../model/Model";

export default class FontMeshRenderer {


    public models: Array<Model> = [];
    private renderer: Renderer;
    private label: string;


    constructor(renderer: Renderer, label = "") {
        this.label = label;
        this.renderer = renderer;

    }

    draw(pass: RenderPass) {
        if (this.models.length == 0) return;
        const passEncoder = pass.passEncoder;

        passEncoder.setBindGroup(0, this.renderer.camera.bindGroup);

        for (let model of this.models) {

            if (!model.visible) continue

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
                    model.mesh.numDrawIndices,

                    1,
                    0,
                    0,
                );
            }

        }
    }

    public addText(textModel: Model) {

        this.models.push(textModel);
    }


    removeText(currentHitText: Model) {
        this.models = []


    }
}

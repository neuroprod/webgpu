import Model from "./Model";
import RenderPass from "../core/RenderPass";
import Renderer from "../Renderer";

export default class ModelRenderer{

    public models: Array<Model>=[];
    private renderer: Renderer;
    constructor(renderer:Renderer)
    {
        this.renderer =renderer;

    }
    draw(pass:RenderPass)
    {
        const passEncoder =pass.passEncoder;

        passEncoder.setBindGroup(0,this.renderer.camera.bindGroup);

        for (let model of this.models) {

            model.material.makePipeLine(pass);

            passEncoder.setPipeline(model.material.pipeLine);

            passEncoder.setBindGroup(1,model.modelTransform.bindGroup);
            passEncoder.setBindGroup(2,model.material.uniforms.bindGroup);


            for (let attribute of model.material.shader.attributes) {
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
    public addModel(model: Model) {

        this.models.push(model);
    }
}

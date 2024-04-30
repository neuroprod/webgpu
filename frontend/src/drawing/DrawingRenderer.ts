import Drawing from "./Drawing";
import Renderer from "../lib/Renderer";
import RenderPass from "../lib/core/RenderPass";


export default class DrawingRenderer {

    public drawings: Array<Drawing> = [];
    private renderer: Renderer;
    private label: string;
    public currentScene = 0;

    constructor(renderer: Renderer, label = "") {
        this.label = label;
        this.renderer = renderer;

    }

    draw(pass: RenderPass) {
        const passEncoder = pass.passEncoder;

        passEncoder.setBindGroup(0, this.renderer.camera.bindGroup);

        for (let model of this.drawings) {

            if (!model.visible) continue
            ///  if(model.sceneID>=0 && model.sceneID!=this.currentScene )continue;
            if (model.numDrawInstances <= 0) continue;
            model.material.makePipeLine(pass);

            passEncoder.setPipeline(model.material.pipeLine);
            passEncoder.setBindGroup(1, model.modelTransform.bindGroup);
            passEncoder.setBindGroup(2, model.material.uniforms.bindGroup);


            for (let attribute of model.material.shader.attributes) {

                let buffer = model.mesh.getBufferByName(attribute.name);
                if (!buffer) buffer = model.getBufferByName(attribute.name);
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
                    model.numDrawInstances,
                    0,
                    0,
                    model.firstDrawInstances,
                );
            }

        }
    }

    public addDrawing(drawing: Drawing) {

        this.drawings.push(drawing);
    }


}

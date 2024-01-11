
import Renderer from "../Renderer";
import RenderPass from "../core/RenderPass";
import Model from "../model/Model";
import Material from "../core/Material";
import FontShader from "./FontShader";
import {BlendFactor, BlendOperation} from "../WebGPUConstants";

export default class FontMeshRenderer{


    public models: Array<Model>=[];
    private renderer: Renderer;
    private label: string;
    private material: Material;

    constructor(renderer:Renderer,label ="")
    {
        this.label = label;
        this.renderer =renderer;
        this.material = new Material(this.renderer,"fontmaterial", new FontShader(this.renderer,"fontShader"))

this.material.depthWrite =false;
        let l :GPUBlendState={

            color:{
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            },
            alpha:{
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            }
        }

        this.material.blendModes=[l];
    }
    draw(pass:RenderPass)
    {
        const passEncoder =pass.passEncoder;

        passEncoder.setBindGroup(0,this.renderer.camera.bindGroup);
        this.material.makePipeLine(pass);
        passEncoder.setPipeline(this.material.pipeLine);
        for (let model of this.models) {

            if(!model.visible)continue




            passEncoder.setBindGroup(1,model.modelTransform.bindGroup);
            passEncoder.setBindGroup(2,this.material.uniforms.bindGroup);



            for (let attribute of this.material.shader.attributes) {

                let buffer  = model.mesh.getBufferByName(attribute.name);

                if(buffer){
                    passEncoder.setVertexBuffer(
                        attribute.slot,
                        buffer,
                    );
                }else{

                    console.log("buffer not found" ,attribute.name)
                }
            }

            if (model.mesh.hasIndices) {

                passEncoder.setIndexBuffer(model.mesh.indexBuffer, model.mesh.indexFormat);
                passEncoder.drawIndexed(
                    model.mesh.numIndices,

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





}

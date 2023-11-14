import Renderer from "./Renderer";
import RenderPass from "./core/RenderPass";
import Material from "./core/Material";
import Quad from "./meshes/Quad";
import {CompareFunction} from "./WebGPUConstants";

export default class Blit{
    private material: Material;
    private mesh: Quad;


    constructor(renderer:Renderer,label:string, material:Material)
    {
        this.material =material;
        this.material.depthWrite =false
        this.material.depthCompare=CompareFunction.Always
        this.mesh=new Quad(renderer)
    }
    draw(pass:RenderPass)
    {
        const passEncoder =pass.passEncoder;
        this.material.makePipeLine(pass);

        passEncoder.setPipeline(this.material.pipeLine);


        passEncoder.setBindGroup(0,this.material.uniforms.bindGroup);

        for (let attribute of this.material.shader.attributes) {
            passEncoder.setVertexBuffer(
                attribute.slot,
                this.mesh.getBufferByName(attribute.name)
            );
        }


            passEncoder.setIndexBuffer(this.mesh.indexBuffer, this.mesh.indexFormat);
            passEncoder.drawIndexed(
                this.mesh.numIndices,
                1,
                0,
                0
            );

    }
}

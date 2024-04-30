import RenderPass from "../lib/core/RenderPass";

import ColorAttachment from "../lib/textures/ColorAttachment";

import RenderTexture from "../lib/textures/RenderTexture";
import Material from "../lib/core/Material";
import Blit from "../lib/Blit";

import Renderer from "../lib/Renderer";

import Texture from "../lib/textures/Texture";
import KawaseDownShader from "../shaders/KawaseDownShader";
import {LoadOp, StoreOp} from "../lib/WebGPUConstants";
import KawaseUpShader from "../shaders/KawaseUpShader";

export default class KawasePass extends RenderPass {
    public colorAttachment: ColorAttachment;


    private blitMaterial: Material;
    private blit: Blit;
    private a: boolean;


    constructor(renderer: Renderer, target: RenderTexture, input: Texture, down: boolean = true, add: boolean = false) {

        super(renderer, "KawasePass");
        this.a = add;
        this.colorAttachment = new ColorAttachment(target);
        if (add) {
            this.colorAttachment.options.loadOp = LoadOp.Load;
            this.colorAttachment.options.storeOp = StoreOp.Store;

        }
        this.colorAttachments = [this.colorAttachment];

        if (down) {
            this.blitMaterial = new Material(this.renderer, "kawaseDown", new KawaseDownShader(this.renderer, "kawaseDown"))
        } else {
            this.blitMaterial = new Material(this.renderer, "kawaseUp", new KawaseUpShader(this.renderer, "kawaseUp"))
        }

        if (add) {
            this.blitMaterial.blendModes = [{
                color: {
                    srcFactor: "one",
                    dstFactor: "one",
                    operation: "add",
                },
                alpha: {
                    srcFactor: "one",
                    dstFactor: "one",
                    operation: "add",
                },
            }];
        }


        this.blitMaterial.uniforms.setTexture("inputTexture", input)


        this.blit = new Blit(renderer, 'Kawase', this.blitMaterial)
    }

    draw() {

        this.blit.draw(this);


    }


}

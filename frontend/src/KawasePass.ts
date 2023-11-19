import RenderPass from "./lib/core/RenderPass";

import ColorAttachment from "./lib/textures/ColorAttachment";

import RenderTexture from "./lib/textures/RenderTexture";
import Material from "./lib/core/Material";
import Blit from "./lib/Blit";

import Renderer from "./lib/Renderer";

import Texture from "./lib/textures/Texture";
import KawaseDownShader from "./shaders/KawaseDownShader";

export default class KawasePass extends RenderPass {
    public colorAttachment: ColorAttachment;



    private blitMaterial: Material;
    private blit: Blit;


    constructor(renderer: Renderer,target:RenderTexture,input:Texture,down:Boolean=true) {

        super(renderer, "KawasePass");
        this.colorAttachment= new ColorAttachment(target);
        this.colorAttachments = [this.colorAttachment];
        if(down){

            this.blitMaterial = new Material(this.renderer, "kawase",   new KawaseDownShader(this.renderer, "kawaseDown"))
        }

        this.blitMaterial.uniforms.setTexture("inputTexture",input)


        this.blit = new Blit(renderer, 'Kawase', this.blitMaterial)
    }

    draw() {

        this.blit.draw(this);


    }





}

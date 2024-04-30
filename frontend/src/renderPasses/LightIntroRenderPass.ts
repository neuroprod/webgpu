import RenderPass from "../lib/core/RenderPass";
import ModelRenderer from "../lib/model/ModelRenderer";
import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import {LoadOp, StoreOp, TextureFormat} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";

import Material from "../lib/core/Material";


import PointLight from "./PointLight";

import Blit from "../lib/Blit";

import ColorV from "../lib/ColorV";

import MainLight from "../MainLight";

import GlobalLightIntroShader from "../shaders/GlobalLightIntroShader";
import {Vector3} from "math.gl";
import UI from "../lib/UI/UI";

export default class LightIntroRenderPass extends RenderPass {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;
    private modelRenderer: ModelRenderer
    private mainLights: Array<MainLight>;
    private lights: Array<PointLight> = []

    private globalLightMaterial: Material;
    private blitGlobalLight: Blit;

    private topColor: ColorV = new ColorV(1.00, 0.92, 0.81, 0.30);
    private midColor: ColorV = new ColorV(1.00, 0.91, 0.82, 0.19);
    private bottomColor: ColorV = new ColorV(1.00, 0.91, 0.82, 0.1);


    private pos1 = new Vector3(-0.35 - 2, 0.00, 0.00)
    private pos2 = new Vector3(1.29 - 2, 2.21, -1.13)
    private pos3 = new Vector3(1.68 - 2, 0.91, -0.34)
    private pos4 = new Vector3(3.0 - 2, 2.00, 0.00)


    constructor(renderer: Renderer) {

        super(renderer, "LightIntroRenderPass");

        this.target = new RenderTexture(renderer, "LightPass", {
            format: TextureFormat.RGBA16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];


        this.depthStencilAttachment = new DepthStencilAttachment(this.renderer.texturesByLabel["GDepth"] as RenderTexture, {
            depthLoadOp: LoadOp.Load,
            depthStoreOp: StoreOp.Store,
            depthReadOnly: true
        });


    }

    init(mainLights: Array<MainLight>) {


        this.modelRenderer = new ModelRenderer(this.renderer, "lightModels")

        this.mainLights = mainLights;

        this.globalLightMaterial = new Material(this.renderer, "blitGlobalLightIntro", new GlobalLightIntroShader(this.renderer, "globalLightIntro"))

        this.setUniforms()


        this.globalLightMaterial.blendModes = [
            {
                color: {
                    srcFactor: "one",
                    dstFactor: "one",
                    operation: "add",
                },
                alpha: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                },
            }

        ]


        this.blitGlobalLight = new Blit(this.renderer, 'blitPost', this.globalLightMaterial)


    }

    public setUniforms() {

        this.mainLights[0].setPositionV(this.pos1)
        this.mainLights[1].setPositionV(this.pos2)
        this.mainLights[2].setPositionV(this.pos3)
        this.mainLights[3].setPositionV(this.pos4)

        this.globalLightMaterial.uniforms.setUniform("lightColor1", this.mainLights[0].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos1", this.mainLights[0].getWorldPos());

        this.globalLightMaterial.uniforms.setUniform("lightColor2", this.mainLights[1].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos2", this.mainLights[1].getWorldPos());

        this.globalLightMaterial.uniforms.setUniform("lightColor3", this.mainLights[2].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos3", this.mainLights[2].getWorldPos());

        this.globalLightMaterial.uniforms.setUniform("lightColor4", this.mainLights[3].color);
        this.globalLightMaterial.uniforms.setUniform("lightPos4", this.mainLights[3].getWorldPos());


        this.globalLightMaterial.uniforms.setUniform("topColor", this.topColor.clone())
        this.globalLightMaterial.uniforms.setUniform("midColor", this.midColor.clone())
        this.globalLightMaterial.uniforms.setUniform("bottomColor", this.bottomColor.clone())


        this.globalLightMaterial.uniforms.setTexture("shadowCube1", this.renderer.texturesByLabel["ShadowCubeColor1"]);
        this.globalLightMaterial.uniforms.setTexture("shadowCube2", this.renderer.texturesByLabel["ShadowCubeColor2"]);
        this.globalLightMaterial.uniforms.setTexture("shadowCube3", this.renderer.texturesByLabel["ShadowCubeColor3"]);
        this.globalLightMaterial.uniforms.setTexture("shadowCube4", this.renderer.texturesByLabel["ShadowCubeColor4"]);

        this.globalLightMaterial.uniforms.setTexture("aoTexture", this.renderer.texturesByLabel["GTAOdenoise"]);
        this.globalLightMaterial.uniforms.setTexture("gNormal", this.renderer.texturesByLabel["GNormal"]);
        this.globalLightMaterial.uniforms.setTexture("gMRA", this.renderer.texturesByLabel["GMRA"]);
        this.globalLightMaterial.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"]);
        this.globalLightMaterial.uniforms.setTexture("gColor", this.renderer.texturesByLabel["GColor"]);

    }

    onUI() {
        UI.LVector("p1", this.pos1);

        this.mainLights[0].onDataUI();
        UI.LVector("p2", this.pos2);
        this.mainLights[1].onDataUI();
        UI.LVector("p3", this.pos3);
        this.mainLights[2].onDataUI();
        UI.LVector("p4", this.pos4);
        this.mainLights[3].onDataUI();
        this.setUniforms()
    }

    draw() {
        //console.log(this.target,this.target.getView() )
        this.blitGlobalLight.draw(this);


    }


}

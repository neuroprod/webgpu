import RenderPass from "../lib/core/RenderPass";

import RenderTexture from "../lib/textures/RenderTexture";
import ColorAttachment from "../lib/textures/ColorAttachment";
import Renderer from "../lib/Renderer";
import {LoadOp, StoreOp} from "../lib/WebGPUConstants";
import DepthStencilAttachment from "../lib/textures/DepthStencilAttachment";

import Material from "../lib/core/Material";

import {Matrix4, Vector2, Vector3, Vector4} from "math.gl";


import UI from "../lib/UI/UI";


import Blit from "../lib/Blit";

import ColorV from "../lib/ColorV";

import MainLight from "../MainLight";

import GlobalLightOutsideShader from "../shaders/GlobalLightOutsideShader";
import RenderSettings from "../RenderSettings";

export default class LightOutsideRenderPass extends RenderPass  {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;

    private globalLightMaterial: Material;
    private blitGlobalLight: Blit;

    private topColor: ColorV = new ColorV(   0.73,0.99,0.95,0.40);
    private midColor: ColorV = new ColorV(1.00, 0.91, 0.82, 0.19);
    private bottomColor: ColorV = new ColorV(1.00, 0.91, 0.82, 0.1);

    private mainLightColor: ColorV = new ColorV(0.99,0.88,0.73,1.00);
    public sunDir =new Vector3(-0.172996,-0.694981,-0.697907);
    private mainLightStrength: number = 4;

    constructor(renderer: Renderer, target: RenderTexture) {

        super(renderer, "LightOutsideRenderPass");
        RenderSettings.registerPass(this);
        this.target = target;
        this.colorAttachment = new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];


        this.depthStencilAttachment = new DepthStencilAttachment(this.renderer.texturesByLabel["GDepth"] as RenderTexture, {
            depthLoadOp: LoadOp.Load,
            depthStoreOp: StoreOp.Store,
            depthReadOnly: true
        });


    }

    init() {


        this.globalLightMaterial = new Material(this.renderer, "blitGlobalLight", new GlobalLightOutsideShader(this.renderer, "globalLightOutside"))

        this.globalLightMaterial.uniforms.setUniform("topColor", this.topColor);
        this.globalLightMaterial.uniforms.setUniform("midColor", this.midColor);
        this.globalLightMaterial.uniforms.setUniform("bottomColor", this.bottomColor);

        this.globalLightMaterial.uniforms.setUniform("lightColor", this.mainLightColor);
        this.globalLightMaterial.uniforms.setUniform("lightDir", new Vector4( this.sunDir.x,this.sunDir.y,this.sunDir.z, 1));
        this.globalLightMaterial.uniforms.setTexture("shadow", this.renderer.texturesByLabel["Shadow"]);
        this.globalLightMaterial.uniforms.setTexture("aoTexture", this.renderer.texturesByLabel["OABlurPass"]);
        this.globalLightMaterial.uniforms.setTexture("gNormal", this.renderer.texturesByLabel["GNormal"]);
        this.globalLightMaterial.uniforms.setTexture("gMRA", this.renderer.texturesByLabel["GMRA"]);
        this.globalLightMaterial.uniforms.setTexture("gDepth", this.renderer.texturesByLabel["GDepth"]);
        this.globalLightMaterial.uniforms.setTexture("gColor", this.renderer.texturesByLabel["GColor"]);

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



    onUI(matrix:Matrix4) {
        UI.pushWindow("Light Outside")

        UI.separator("Sun Light")
        this.mainLightColor.w =1;
        UI.LColor("color", this.mainLightColor)
        this.mainLightStrength = UI.LFloatSlider("strength", this.mainLightStrength, 0, 20);
        UI.LVector("dir",this.sunDir,true);

        UI.separator("Global Light")
        UI.LColor("topLight", this.topColor)
        UI.LColor("midLight", this.midColor)
        UI.LColor("bottomLight", this.bottomColor)
        this.mainLightColor.w = this.mainLightStrength;
        this.globalLightMaterial.uniforms.setUniform("lightColor",  this.mainLightColor)
        this.globalLightMaterial.uniforms.setUniform("lightDir", new Vector4( this.sunDir.x,this.sunDir.y,this.sunDir.z, 1));

        this.globalLightMaterial.uniforms.setUniform("topColor", this.topColor)
        this.globalLightMaterial.uniforms.setUniform("midColor", this.midColor)
        this.globalLightMaterial.uniforms.setUniform("bottomColor", this.bottomColor)

        this.globalLightMaterial.uniforms.setUniform( "shadowMatrix",matrix)
        UI.popWindow()
    }
onSettingsChange() {
    super.onSettingsChange();
    this.globalLightMaterial.uniforms.setUniform("dof",RenderSettings.dof_Settings)
}

    draw() {

        this.blitGlobalLight.draw(this);


    }


}

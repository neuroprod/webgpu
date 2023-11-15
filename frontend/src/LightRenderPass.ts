import RenderPass from "./lib/core/RenderPass";
import ModelRenderer from "./lib/model/ModelRenderer";
import RenderTexture from "./lib/textures/RenderTexture";
import ColorAttachment from "./lib/textures/ColorAttachment";
import Renderer from "./lib/Renderer";
import {LoadOp, StoreOp, TextureFormat} from "./lib/WebGPUConstants";
import DepthStencilAttachment from "./lib/textures/DepthStencilAttachment";
import Model from "./lib/model/Model";
import Material from "./lib/core/Material";
import LightShader from "./shaders/LightShader";
import Sphere from "./lib/meshes/Sphere";
import {Vector2, Vector3, Vector4} from "math.gl";
import {IResizable} from "./lib/IResizable";
import Timer from "./lib/Timer";

export default class extends RenderPass    implements IResizable {


    public target: RenderTexture;
    private colorAttachment: ColorAttachment;
    private modelRenderer:ModelRenderer
    private shader:LightShader
    private material: Material;
    private mesh: Sphere;
    private model: Model;


    constructor(renderer: Renderer) {

        super(renderer, "LightRenderPass");
        this.target = new RenderTexture(renderer, "LightPass", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment= new ColorAttachment(this.target);
        this.colorAttachments = [this.colorAttachment];


        this.depthStencilAttachment = new DepthStencilAttachment(this.renderer.texturesByLabel["GDepth"] as RenderTexture,{   depthLoadOp: LoadOp.Load,
            depthStoreOp: StoreOp.Store,
            depthReadOnly: true});


        this.modelRenderer =new ModelRenderer(renderer)
        this.shader =new LightShader(renderer,"lightShader");
        this.mesh =new Sphere(renderer);



        this.material =new Material(renderer,"testLight",this.shader)
        this.material.depthWrite =false;
       this.model =new Model(renderer,"testLight");

       let radius =3;
       let position =new Vector3(-1,1,-2)
        this.model.setPosition(position.x,position.y,position.z)
        this.model.setScale(radius,radius,radius)
        this.model.material =this.material;
        this.model.mesh =this.mesh;

        this.model.material.uniforms.setUniform("position",new Vector4(position.x,position.y,position.z,radius))

      this.material.uniforms.setTexture("gPosition",this.renderer.texturesByLabel["GPosition"])
        this.material.uniforms.setTexture("gNormal",this.renderer.texturesByLabel["GNormal"])
        this.material.uniforms.setTexture("gMRA",this.renderer.texturesByLabel["GMRA"])
        this.material.uniforms.setTexture("gColor",this.renderer.texturesByLabel["GColor"])
        this.modelRenderer.addModel(this.model);


    }
    onScreenResize(size: Vector2) {
        this.material.uniforms.setUniform("textureSize",new Vector2(this.renderer.width,this.renderer.height))
    }

    update()
    {
        let position =new Vector3(Math.sin(Timer.time)*2.0,Math.cos(Timer.time*0.5),-2+Math.cos(Timer.time*0.3)*0.5)
        this.model.setPosition(position.x,position.y,position.z)
        this.model.material.uniforms.setUniform("position",new Vector4(position.x,position.y,position.z,3))
    }
    draw() {

        this.modelRenderer.draw(this);


    }
}

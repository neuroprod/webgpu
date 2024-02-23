import PreLoader from "./lib/PreLoader";
import Renderer from "./lib/Renderer";
import GLFTLoader from "./GLFTLoader";
import TextureLoader from "./lib/textures/TextureLoader";
import ModelRenderer from "./lib/model/ModelRenderer";
import Model from "./lib/model/Model";
import GameModel from "./GameModel";
import Plane from "./lib/meshes/Plane";
import {render} from "react-dom";
import Material from "./lib/core/Material";
import SmokeShader from "./shaders/SmokeShader";
import {CullMode} from "./lib/WebGPUConstants";
import {NumericArray, Vector3} from "math.gl";
import Timer from "./lib/Timer";
import DefaultTextures from "./lib/textures/DefaultTextures";

export default class Intro{
    private renderer: Renderer;
  modelRenderer: ModelRenderer;
    private face: Model;
    private pants: Model;
    private body: Model;
    private background: Model;
    private coffee: Model;
    modelsRoom:Array<Model>=[]
    modelsOutside:Array<Model>=[]
    private smoke: Model;
    modelRendererTrans: ModelRenderer;
    private segmentsX: number =1;
    private segmentsY: number=10;
    private positionData: Float32Array;
    private coffeeOffset: Vector3=new Vector3(0,0.1,0);
    private smokePositions:Array<Vector3>=[]
    private stick: Model;
    private shovel: Model;
    private fishFood: Model;
    constructor(renderer:Renderer,preloader:PreLoader) {

        this.renderer = renderer
        new TextureLoader(this.renderer, preloader, "textures/body_Color.png", {});
        new TextureLoader(this.renderer, preloader, "textures/body_MRA.png", {});
        new TextureLoader(this.renderer, preloader, "textures/body_Normal.png", {});

        new TextureLoader(this.renderer, preloader, "textures/pants_Color.png", {});
        new TextureLoader(this.renderer, preloader, "textures/pants_MRA.png", {});
        new TextureLoader(this.renderer, preloader, "textures/pants_Normal.png", {});

        new TextureLoader(this.renderer, preloader, "textures/coffee_Color.png", {});
        new TextureLoader(this.renderer, preloader, "textures/coffee_MRA.png", {});
        new TextureLoader(this.renderer, preloader, "textures/coffee_Normal.png", {});



        new TextureLoader(this.renderer, preloader, "textures/face_Color.png", {});
        new TextureLoader(this.renderer, preloader, "textures/face_MRA.png", {});
        new TextureLoader(this.renderer, preloader, "textures/face_Normal.png", {});
        new TextureLoader(this.renderer, preloader, "textures/face_Op.png", {});






        const vertexCount: number = (this.segmentsX + 1) * (this.segmentsY + 1);
        this.positionData = new Float32Array(vertexCount * 3);


    }
    setNewTextures(){

        this.fishFood.material.uniforms.setTexture("colorTexture",this.renderer.texturesByLabel["textures/fishFood_Color.png"])
        this.fishFood.material.uniforms.setTexture("mraTexture",this.renderer.texturesByLabel["textures/fishFood_MRA.png"])
        this.fishFood.material.uniforms.setTexture("normalTexture",this.renderer.texturesByLabel["textures/fishFood_Normal.png"])
        this.shovel.material.uniforms.setTexture("colorTexture",this.renderer.texturesByLabel["textures/shovel_Color.png"])
        this.shovel.material.uniforms.setTexture("mraTexture",this.renderer.texturesByLabel["textures/shovel_MRA.png"])
        this.shovel.material.uniforms.setTexture("normalTexture",this.renderer.texturesByLabel["textures/shovel_Normal.png"])
    }
    init(glFTLoaderChar:GLFTLoader)
    {
        this.modelRenderer = new ModelRenderer(this.renderer, "introModels")
        this.modelRendererTrans= new ModelRenderer(this.renderer, "introModelsTrans")
        this.face = glFTLoaderChar.modelsByName["face"]
        this.modelRenderer.addModel(this.face)

        this.pants = glFTLoaderChar.modelsByName["pants"]
        this.modelRenderer.addModel(this.pants)


        this.body = glFTLoaderChar.modelsByName["body"]
        this.modelRenderer.addModel(this.body)


        this.background = glFTLoaderChar.modelsByName["background"]
        this.modelRenderer.addModel(      this.background )

        this.coffee = glFTLoaderChar.modelsByName["coffee"]
        this.modelRenderer.addModel(     this.coffee )

        this.stick = glFTLoaderChar.modelsByName["stickHold"]
        this.shovel = glFTLoaderChar.modelsByName["shovelHold"]
        this.fishFood =      GameModel.renderer.modelByLabel["fishFoodHold"];

        this.fishFood.visible =false;
        this.modelsRoom.push(this.face,this.body,this.pants)
        this.modelsOutside.push(this.face,this.body,this.pants,this.stick,this.shovel, this.fishFood)

        GameModel.characterHandler.rotate(0.1)

        GameModel.characterHandler.setMixAnimation("coffee",0.9,0)

        this.smoke =new Model(this.renderer,"smoke");
        this.smoke.mesh =new Plane(this.renderer,1,1,this.segmentsX,this.segmentsY,false);
        this.smoke.material =new Material(this.renderer,"smoke",new SmokeShader(this.renderer,"smoke"))
        this.smoke.material.depthWrite =false;
        this.smoke.material.cullMode=CullMode.None
        this.modelRendererTrans.addModel(this.smoke)
    }
    update(){



        let pos = this.coffee.getWorldPos(this.coffeeOffset)
        if(this.smokePositions.length==0){
            for(let i=0;i<this.segmentsY+1;i++){
                let p = new Vector3()
                p.from(pos);

                this.smokePositions.push(p)
            }
        }
        let lerpValue =0.1
        if(Timer.frame<10)lerpValue=0.5;
        this.smokePositions[0].from(pos)
        let wind =-Math.abs(Math.sin(Timer.time*0.5)+Math.sin(Timer.time*0.21))*0.002
        for(let i=1;i<this.segmentsY+1;i++){

            this.smokePositions[i].lerp(this.smokePositions[i] as NumericArray,this.smokePositions[i-1] as NumericArray,lerpValue)
            this.smokePositions[i].y =i*0.03+0.1;
            this.smokePositions[i].x+=(i/this.segmentsY)*wind;

        }
        let i=0;
        for (let y: number = 0; y < this.segmentsY + 1; y++) {
            for (let x: number = 0; x < this.segmentsX + 1; x++) {
                this.positionData[i++] = (-1 + (x / this.segmentsX) * 2) * (0.15 / 2)+this.smokePositions[y].x;

                this.positionData[i++] =  this.smokePositions[y].y;
                this.positionData[i++] = +this.smokePositions[y].z;
            }
        }

        this.smoke.mesh.updateBuffer("aPos", this.positionData)
        this.smoke.material.uniforms.setUniform("time",Timer.time)
    }
}

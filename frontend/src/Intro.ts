import PreLoader from "./lib/PreLoader";
import Renderer from "./lib/Renderer";
import GLFTLoader from "./GLFTLoader";
import TextureLoader from "./lib/textures/TextureLoader";
import ModelRenderer from "./lib/model/ModelRenderer";
import Model from "./lib/model/Model";
import GameModel from "./GameModel";

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
    }
    init(glFTLoaderChar:GLFTLoader)
    {
        this.modelRenderer = new ModelRenderer(this.renderer, "introModels")
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


        this.modelsRoom.push(this.face,this.body,this.pants)
        this.modelsOutside.push(this.face,this.body,this.pants)

        GameModel.characterHandler.rotate(0.1)

        GameModel.characterHandler.setMixAnimation("coffee",0.9,0)
    }

}

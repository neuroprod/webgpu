import CanvasManager from "./lib/CanvasManager";
import Renderer from "./lib/Renderer";


import PreLoader from "./lib/PreLoader";

import Camera from "./lib/Camera";
import GLFTLoader from "./GLFTLoader";

import ImagePreloader from "./ImagePreloader";

import MouseListener from "./lib/MouseListener";
import CanvasRenderPass from "./renderPasses/CanvasRenderPass";
import TimeStampQuery from "./lib/TimeStampQuery";
import UI from "./lib/UI/UI";
import GBufferRenderPass from "./renderPasses/GBufferRenderPass";
import Timer from "./lib/Timer";
import LightRenderPass from "./renderPasses/LightRoomRenderPass";

import JSONLoader from "./JSONLoader";
import AORenderPass from "./renderPasses/AORenderPass";
import AOBlurRenderPass from "./renderPasses/AOBlurRenderPass";
import ReflectionRenderPass from "./renderPasses/ReflectionRenderPass";
import TextureLoader from "./lib/textures/TextureLoader";
import GlassRenderPass from "./renderPasses/GlassRenderPass";
import BlurLight from "./renderPasses/BlurLight";
import CombinePass from "./renderPasses/CombinePass";
import RenderSettings from "./RenderSettings";
import BlurBloom from "./renderPasses/BlurBloom";

import ShadowCube from "./renderPasses/ShadowCube";
import AnimationMixer from "./lib/animation/AnimationMixer";
import CharacterHandler from "./CharacterHandler";
import Room from "./Room";
import Outside from "./Outside";
import LightOutsideRenderPass from "./renderPasses/LightOutsideRenderPass";
import ShadowPass from "./renderPasses/ShadowPass";
import DOFPass from "./renderPasses/DOFPass";
import PostRenderPass from "./renderPasses/PostRenderPass";
import FXAARenderPass from "./renderPasses/FXAARenderPass";
import GameModel, {Scenes, Transitions} from "./GameModel";
import GameCamera from "./GameCamera";
import Ray from "./lib/Ray";
import UI_I from "./lib/UI/UI_I";
import Drawer from "./drawing/Drawer";
import DrawingPreloader from "./drawing/DrawingPreloader";
import {preloadImages} from "./PreloadData";


export default class Main {
    private canvasManager: CanvasManager;
    private renderer: Renderer;

    private mouseListener: MouseListener

    private preloader: PreLoader;
    private camera: Camera;





    private canvasRenderPass: CanvasRenderPass
    private gBufferPass: GBufferRenderPass;
    private timeStampQuery: TimeStampQuery;
    private lightRoomPass: LightRenderPass;

    private lightRoomJson: JSONLoader;
    private aoPass: AORenderPass;
    private aoBlurPass: AOBlurRenderPass;
    private reflectionPass: ReflectionRenderPass;
    private glassPass: GlassRenderPass;
    private blurLightPass: BlurLight;

    private combinePass: CombinePass;
    private numberOfQueries: number = 11;
    private blurBloomPass: BlurBloom;


    private shadowPassCube: ShadowCube;


    private glFTLoaderChar: GLFTLoader;
    //private transformDebugger: TransformDebugger;
    private animationMixer: AnimationMixer;
    private characterHandler: CharacterHandler;


    private room: Room;
    private outside: Outside;


    private lightOutsidePass: LightOutsideRenderPass;
    private shadowPass: ShadowPass;
    private dofPass: DOFPass;
    private postPass: PostRenderPass;
    private FXAAPass: FXAARenderPass;
    private gameCamera: GameCamera;
    public mouseRay:Ray;
    private drawer:Drawer
    private drawingPreloader: DrawingPreloader;
    constructor(canvas: HTMLCanvasElement) {

        this.canvasManager = new CanvasManager(canvas);
        this.renderer = new Renderer()
        this.renderer.setup(canvas).then(() => {
            this.setup()
        })
        this.mouseListener = new MouseListener(canvas)
    }

    //pre-preload
    public setup() {
        this.preloader = new PreLoader(
            ()=>{},
            this.startFinalPreload.bind(this)
        );
        this.camera = new Camera(this.renderer, "mainCamera")
        this.mouseRay =new Ray(this.renderer);
        this.renderer.camera = this.camera;
        this.gameCamera =new GameCamera(this.camera,this.renderer)
        this.timeStampQuery = new TimeStampQuery(this.renderer, this.numberOfQueries)
        this.glFTLoaderChar = new GLFTLoader(this.renderer, "character_animation", this.preloader);
        new TextureLoader(this.renderer, this.preloader, "textures/body_Color.png", {});
        new TextureLoader(this.renderer, this.preloader, "textures/body_MRA.png", {});
        new TextureLoader(this.renderer, this.preloader, "textures/body_Normal.png", {});
        new TextureLoader(this.renderer, this.preloader, "brdf_lut.png", {});

















    }
    public startFinalPreload(){


        this.gBufferPass = new GBufferRenderPass(this.renderer);
        this.shadowPassCube = new ShadowCube(this.renderer);
        this.shadowPass = new ShadowPass(this.renderer);
        this.aoPass = new AORenderPass(this.renderer);
        this.aoBlurPass = new AOBlurRenderPass(this.renderer);
        this.lightRoomPass = new LightRenderPass(this.renderer);
        this.lightOutsidePass = new LightOutsideRenderPass(this.renderer, this.lightRoomPass.target);
        this.blurLightPass = new BlurLight(this.renderer);
        this.reflectionPass = new ReflectionRenderPass(this.renderer);
        this.glassPass = new GlassRenderPass(this.renderer)
        this.combinePass = new CombinePass(this.renderer)
        this.dofPass = new DOFPass(this.renderer);
        this.blurBloomPass = new BlurBloom(this.renderer)
        this.postPass = new PostRenderPass(this.renderer)
        this.FXAAPass = new FXAARenderPass(this.renderer);

        this.canvasRenderPass = new CanvasRenderPass(this.renderer);
        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment)

        UI.setWebGPU(this.renderer)
        GameModel.main=this;




        console.log("startPreload2")
        console.log("ready to render")

        //
        this.preloader = new PreLoader(
            ()=>{},
            this.init.bind(this)
        );

        this.drawingPreloader = new DrawingPreloader()
        this.drawingPreloader.load(this.renderer,this.preloader)

        this.room = new Room(this.renderer, this.preloader);
        this.outside = new Outside(this.renderer, this.preloader);

        ImagePreloader.load(this.renderer, this.preloader);


       this.lightRoomJson = new JSONLoader("lightRoom", this.preloader);

    }
    private init() {

        this.room.init()
        this.outside.init();

        this.lightRoomPass.init(this.lightRoomJson.data, this.room.mainLight, [this.room.leftHolder, this.room.rightHolder, this.room.centerRightHolder])
        this.lightOutsidePass.init();


        this.room.makeTransParent();
        this.outside.makeTransParent();
        this.lightOutsidePass.lightGrave =this.outside.lightGrave;

        //this.gBufferPass.modelRenderer =this.outside.modelRenderer;
        this.shadowPass.init();
        this.dofPass.init();
        for (let m of this.glFTLoaderChar.models) {
            //this.gBufferPass.modelRenderer.addModel(m)
            this.outside.modelRenderer.addModel(m)
            this.room.modelRenderer.addModel(m)
        }

        this.animationMixer = new AnimationMixer()
        this.animationMixer.setAnimations(this.glFTLoaderChar.animations)


        this.characterHandler = new CharacterHandler(this.renderer, this.camera, this.glFTLoaderChar.root, this.animationMixer)
        this.outside.modelRenderer.addModel(this.characterHandler.floorHitIndicator);
        this.room.modelRenderer.addModel(this.characterHandler.floorHitIndicator);

        this.drawer =new Drawer(this.renderer);
        this.gBufferPass.drawingRenderer.addDrawing(this.drawer.drawing)
        for(let d of this.drawingPreloader.drawings){
            d.resolveParent();
            this.gBufferPass.drawingRenderer.addDrawing(d)
        }
        GameModel.setTransition(Transitions.START_GAME)


        this.tick()
    }


    public setScene(scene:Scenes) {

        if (scene== Scenes.ROOM) {
            GameModel.yMouseScale = 1
            GameModel.yMouseCenter = 1
            GameModel.sceneHeight = 3
            this.gBufferPass.modelRenderer = this.room.modelRenderer;
            this.glassPass.modelRenderer = this.room.modelRendererTrans;
            this.lightRoomPass.setDirty();
            this.characterHandler.setRoot(this.room.root,0);
            this.shadowPassCube.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube.setLightPos(this.room.mainLight.getWorldPos())

        } else {
            GameModel.yMouseScale = 1.5
            GameModel.yMouseCenter = 0
            GameModel.sceneHeight = 4
            this.gameCamera.setOutsidePos();
            this.gBufferPass.modelRenderer = this.outside.modelRenderer;
            this.glassPass.modelRenderer = this.outside.modelRendererTrans;
            this.lightOutsidePass.setDirty();
            this.characterHandler.setRoot(this.outside.root,1);
            this.shadowPass.setModels(this.outside.modelRenderer.models);
            this.shadowPassCube.setModels(this.outside.modelRenderer.models);
            this.shadowPassCube.setLightPos(this.outside.lightGrave.getWorldPos())
        }


    }





    private tick() {

        window.requestAnimationFrame(() => this.tick());
        GameModel.mousePos =this.mouseListener.mousePos.clone();
        GameModel.mouseDownThisFrame = this.mouseListener.isDownThisFrame;
        Timer.update();
        this.update();
        UI.updateGPU();
        this.renderer.update(this.onDraw.bind(this));
        this.timeStampQuery.getData();
        this.mouseListener.reset()

    }

    private update() {
        if(UI.needsMouse()) {
            this.mouseListener.isDownThisFrame =false;
        }




        if(!GameModel.lockView) {

            this.gameCamera.update();

        }
        this.mouseRay.setFromCamera(this.camera,this.mouseListener.mousePos)
        if(!GameModel.lockView) this.characterHandler.update(this.mouseListener.mousePos.clone(), this.mouseListener.isDownThisFrame)

        if(this.drawer.enabled) this.drawer.setMouseData(this.mouseListener.isDownThisFrame,this.mouseListener.isUpThisFrame,this.mouseRay)
        //this.shadowPassCube.setLightPos(this.room.mainLight.getWorldPos());
        this.shadowPass.update(this.lightOutsidePass.sunDir,this.gameCamera.posSmooth)
            //this.updateCamera();
        if (GameModel.currentScene== Scenes.ROOM) {
            this.room.update();
            this.room.checkMouseHit(this.mouseRay);
            this.shadowPassCube.setLightPos(this.room.mainLight.getWorldPos());
        } else {
            this.outside.update()
            this.shadowPassCube.setLightPos(this.outside.lightGrave.getWorldPos());
        }





        UI.pushWindow("Performance")
        if (!this.renderer.useTimeStampQuery) UI.LText("Enable by running Chrome with: --enable-dawn-features=allow_unsafe_apis", "", true)
        this.timeStampQuery.onUI();
        UI.popWindow()

            this.lightRoomPass.onUI();
            this.lightOutsidePass.onUI(this.shadowPass.camera.viewProjection);
            this.shadowPass.onUI()



        UI.pushWindow("Render Setting")
        this.canvasRenderPass.onUI();
        UI.pushGroup("AO");
        this.aoPass.onUI();
        UI.popGroup()
        RenderSettings.onUI();
        UI.popWindow()

this.drawer.onUI();

    }

    onDraw() {
        this.timeStampQuery.start();
        if (GameModel.currentScene ==Scenes.ROOM) {

            this.shadowPassCube.add();
        }else {
            this.shadowPass.add();
            this.shadowPassCube.add();
        }

        this.timeStampQuery.setStamp("ShadowPass");
        this.gBufferPass.add();
        this.timeStampQuery.setStamp("GBufferPass");
        this.aoPass.add();
        this.aoBlurPass.add();
        this.timeStampQuery.setStamp("AOPass");
        if (GameModel.currentScene ==Scenes.ROOM) {
            this.lightRoomPass.add();
        } else {
            this.lightOutsidePass.add();
        }
        this.timeStampQuery.setStamp("LightPass");
        this.blurLightPass.add()
        this.timeStampQuery.setStamp("blurLight");
        this.reflectionPass.add()
        this.timeStampQuery.setStamp("ReflectionPass");
        this.glassPass.add();
        this.timeStampQuery.setStamp("GlassPass");
        this.combinePass.add()
        this.timeStampQuery.setStamp("CombinePass");
        this.dofPass.add()
        this.timeStampQuery.setStamp("dofPass");
        this.blurBloomPass.add();
        this.timeStampQuery.setStamp("BlurBloomPass");
        this.postPass.add();
        this.FXAAPass.add();
        this.canvasRenderPass.add();
        this.timeStampQuery.setStamp("CanvasPass");
        this.timeStampQuery.stop();
    }

}

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
import Drawer from "./drawing/Drawer";
import DrawingPreloader from "./drawing/DrawingPreloader";
import {saveToJsonFile} from "./lib/SaveUtils";
import ComputeShaderTest from "./ComputePasses/ComputeShaderTest";
import {FloorHitIndicator} from "./extras/FloorHitIndicator";
import OutlinePass from "./renderPasses/OutlinePass";
import MainLight from "./MainLight";
import ModelRenderer from "./lib/model/ModelRenderer";
import AOPreprocessDepth from "./ComputePasses/AOPreprocessDepth";
import GTAO from "./ComputePasses/GTAO";
import GTAOdenoise from "./ComputePasses/GTAOdenoise";
import Simplex from "./ComputePasses/Simplex";
import GameUI from "./GameUI";


export default class Main {
    public mouseRay: Ray;
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
    private numberOfQueries: number = 12;
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
    private drawer: Drawer
    private drawingPreloader: DrawingPreloader;
    private computeShadertest: ComputeShaderTest;
    private outlinePass: OutlinePass;
    private mainLight: MainLight;
    private aoPreCompDepth: AOPreprocessDepth;
    private gtaoPass: GTAO;
    private gtaoDenoise: GTAOdenoise;
    private simplexNoisePass: Simplex;
    private gameUI: GameUI;

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
            () => {
            },
            this.startFinalPreload.bind(this)
        );
        UI.setWebGPU(this.renderer)
        this.camera = new Camera(this.renderer, "mainCamera")
        this.mouseRay = new Ray(this.renderer);
        this.renderer.camera = this.camera;
        this.gameCamera = new GameCamera(this.camera, this.renderer)
        this.timeStampQuery = new TimeStampQuery(this.renderer, this.numberOfQueries)
        this.glFTLoaderChar = new GLFTLoader(this.renderer, "character_animation", this.preloader);
        new TextureLoader(this.renderer, this.preloader, "textures/body_Color.png", {});
        new TextureLoader(this.renderer, this.preloader, "textures/body_MRA.png", {});
        new TextureLoader(this.renderer, this.preloader, "textures/body_Normal.png", {});

        new TextureLoader(this.renderer, this.preloader, "textures/pants_Color.png", {});
        new TextureLoader(this.renderer, this.preloader, "textures/pants_MRA.png", {});
        new TextureLoader(this.renderer, this.preloader, "textures/pants_Normal.png", {});

        new TextureLoader(this.renderer, this.preloader, "textures/face_Color.png", {});
        new TextureLoader(this.renderer, this.preloader, "textures/face_MRA.png", {});
        new TextureLoader(this.renderer, this.preloader, "textures/face_Normal.png", {});
        new TextureLoader(this.renderer, this.preloader, "textures/face_Op.png", {});

        new TextureLoader(this.renderer, this.preloader, "brdf_lut.png", {});
        new TextureLoader(this.renderer, this.preloader, "BlueNoise.png", {});
        this.lightRoomJson = new JSONLoader("lightRoom", this.preloader);

        this.mainLight = new MainLight(this.renderer)
    }

    public startFinalPreload() {


        this.simplexNoisePass = new Simplex(this.renderer)
        this.gBufferPass = new GBufferRenderPass(this.renderer);

        this.aoPreCompDepth = new AOPreprocessDepth(this.renderer)
        this.gtaoPass = new GTAO(this.renderer);
        this.gtaoDenoise = new GTAOdenoise(this.renderer)

        this.shadowPassCube = new ShadowCube(this.renderer, null, null);
        this.shadowPass = new ShadowPass(this.renderer);
        // this.aoPass = new AORenderPass(this.renderer);
        //this.aoBlurPass = new AOBlurRenderPass(this.renderer);

        this.lightRoomPass = new LightRenderPass(this.renderer);
        this.lightOutsidePass = new LightOutsideRenderPass(this.renderer, this.lightRoomPass.target);
        this.blurLightPass = new BlurLight(this.renderer);
        this.reflectionPass = new ReflectionRenderPass(this.renderer);
        this.glassPass = new GlassRenderPass(this.renderer)
        this.combinePass = new CombinePass(this.renderer)
        this.dofPass = new DOFPass(this.renderer);
        this.blurBloomPass = new BlurBloom(this.renderer)
        this.outlinePass = new OutlinePass(this.renderer);
        this.postPass = new PostRenderPass(this.renderer)
        this.FXAAPass = new FXAARenderPass(this.renderer);

        this.canvasRenderPass = new CanvasRenderPass(this.renderer);
        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment)


        GameModel.main = this;
        GameModel.renderer = this.renderer;
        GameModel.outlinePass = this.outlinePass;
        GameModel.gameCamera = this.gameCamera;

        this.lightRoomPass.init(this.lightRoomJson.data, this.mainLight, [])

        //
        this.preloader = new PreLoader(
            () => {
            },
            this.init.bind(this)
        );
        new TextureLoader(this.renderer, this.preloader, "WaterNormal.jpg", {});
        this.drawingPreloader = new DrawingPreloader()
        this.drawingPreloader.load(this.renderer, this.preloader)
        this.gameUI = new GameUI(this.renderer, this.preloader);
        this.room = new Room(this.renderer, this.preloader);
        this.outside = new Outside(this.renderer, this.preloader);

        ImagePreloader.load(this.renderer, this.preloader);


//init char
        this.animationMixer = new AnimationMixer()
        this.animationMixer.setAnimations(this.glFTLoaderChar.animations)


        this.characterHandler = new CharacterHandler(this.renderer, this.camera, this.glFTLoaderChar, this.animationMixer)

        GameModel.characterHandler = this.characterHandler;
        //  this.lightRoomPass.init(this.lightRoomJson.data, this.room.mainLight, [this.room.leftHolder, this.room.rightHolder, this.room.centerHolder])
        this.gBufferPass.modelRenderer = new ModelRenderer(this.renderer, "introModels")
        this.gBufferPass.modelRenderer.addModel(this.glFTLoaderChar.models[0])


        this.drawer = new Drawer(this.renderer);
        this.dofPass.init();
        this.outlinePass.init()
        RenderSettings.onChange()
        this.shadowPassCube.setModels(this.gBufferPass.modelRenderer.models);
        this.shadowPassCube.setLightPos(this.mainLight.getWorldPos())

        this.tick()
    }

    public setScene(scene: Scenes) {

        if (scene == Scenes.ROOM) {
            GameModel.yMouseScale = 1
            GameModel.yMouseCenter = 1
            GameModel.sceneHeight = 3
            this.gBufferPass.drawingRenderer.currentScene = 0;
            this.gBufferPass.modelRenderer = this.room.modelRenderer;
            this.glassPass.modelRenderer = this.room.modelRendererTrans;
            this.lightRoomPass.setDirty();
            this.characterHandler.setRoot(this.room.root, 0);
            this.shadowPassCube.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube.setLightPos(this.room.mainLight.getWorldPos())
            RenderSettings.exposure = 1.8;


        } else {
            GameModel.yMouseScale = 1.5
            GameModel.yMouseCenter = 0
            GameModel.sceneHeight = 4


            this.gBufferPass.drawingRenderer.currentScene = 1;
            this.gameCamera.setOutsidePos();
            this.gBufferPass.modelRenderer = this.outside.modelRenderer;
            this.glassPass.modelRenderer = this.outside.modelRendererTrans;
            this.lightOutsidePass.setDirty();
            this.characterHandler.setRoot(this.outside.root, 1);
            this.shadowPass.setModels(this.outside.modelRenderer.models);
            this.shadowPassCube.setModels(this.outside.modelRenderer.models);
            this.shadowPassCube.setLightPos(this.outside.lightGrave.getWorldPos())
            RenderSettings.exposure = 1.2;

        }


    }

    onDraw() {

        this.timeStampQuery.start();


        this.simplexNoisePass.add()
        this.timeStampQuery.setStamp("noise");
        if (GameModel.currentScene == Scenes.ROOM || GameModel.currentScene == Scenes.PRELOAD) {

            this.shadowPassCube.add();
        } else if (GameModel.currentScene == Scenes.OUTSIDE) {

            this.shadowPass.add();
            this.shadowPassCube.add();
        }

        this.timeStampQuery.setStamp("ShadowPass");
        this.gBufferPass.add();
        this.timeStampQuery.setStamp("GBufferPass");

        this.aoPreCompDepth.add();
        this.gtaoPass.add();
        this.gtaoDenoise.add();

        // this.timeStampQuery.setStamp("AOTestPass");
        // this.aoPass.add();
        // this.aoBlurPass.add();
        this.timeStampQuery.setStamp("AOPass");
        if (GameModel.currentScene == Scenes.ROOM || GameModel.currentScene == Scenes.PRELOAD) {
            this.lightRoomPass.add();
        } else if (GameModel.currentScene == Scenes.OUTSIDE) {
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
        this.outlinePass.add();
        this.postPass.add();
        this.FXAAPass.add();
        this.canvasRenderPass.add();
        this.timeStampQuery.setStamp("CanvasPass");
        this.timeStampQuery.stop();

    }

    init() {
        this.room.init()
        this.outside.init();
        this.gameUI.init();
        //  this.outlinePass.init()
        this.lightRoomPass.init(this.lightRoomJson.data, this.room.mainLight, [this.room.leftHolder, this.room.rightHolder, this.room.centerHolder])
        this.lightOutsidePass.init();


        this.room.makeTransParent();
        this.outside.makeTransParent();
        this.lightOutsidePass.lightGrave = this.outside.lightGrave;


        this.shadowPass.init();

        for (let m of this.glFTLoaderChar.models) {
            //this.gBufferPass.modelRenderer.addModel(m)
            this.outside.modelRenderer.addModel(m)
            this.room.modelRenderer.addModel(m)
        }
        for (let m of this.gameUI.glFTLoader.models) {
            //this.gBufferPass.modelRenderer.addModel(m)
            this.outside.modelRenderer.addModel(m)
            this.room.modelRenderer.addModel(m)
        }


        GameModel.floorHitIndicator = new FloorHitIndicator(this.renderer);

        this.outside.modelRenderer.addModel(GameModel.floorHitIndicator);
        this.room.modelRenderer.addModel(GameModel.floorHitIndicator);

        //this.drawer = new Drawer(this.renderer);
        this.gBufferPass.drawingRenderer.addDrawing(this.drawer.drawing)
        for (let d of this.drawingPreloader.drawings) {
            d.resolveParent();
            this.gBufferPass.drawingRenderer.addDrawing(d)
        }

        GameModel.setTransition(Transitions.GO_OUTSIDE)


        //this.tick()
    }

     tick() {

        window.requestAnimationFrame(() => this.tick());
        GameModel.mousePos = this.mouseListener.mousePos.clone();
        GameModel.mouseDownThisFrame = this.mouseListener.isDownThisFrame;
        Timer.update();
        this.update();
        UI.updateGPU();
        this.renderer.update(this.onDraw.bind(this));
        this.timeStampQuery.getData();
        this.mouseListener.reset()

    }

     update() {
        this.simplexNoisePass.update();
        if (UI.needsMouse()) {
            this.mouseListener.isDownThisFrame = false;
        }


        if (!GameModel.lockView) {

            this.gameCamera.update();
            this.gameUI.update()
        }

        this.mouseRay.setFromCamera(this.camera, this.mouseListener.mousePos)
        if (!GameModel.lockView) this.characterHandler.update(this.mouseListener.mousePos.clone(), this.mouseListener.isDownThisFrame)

        if (this.drawer.enabled) this.drawer.setMouseData(this.mouseListener.isDownThisFrame, this.mouseListener.isUpThisFrame, this.mouseRay)
        //this.shadowPassCube.setLightPos(this.room.mainLight.getWorldPos());
        let uiHit = this.gameUI.checkMouseHit(this.mouseRay)
        this.gameUI.updateMouse(this.mouseListener)
        if (GameModel.currentScene == Scenes.PRELOAD) {
            this.shadowPassCube.setLightPos(this.mainLight.getWorldPos());

            GameModel.characterPos.set(-(this.renderer.ratio * GameModel.sceneHeight) / 2, -1.5, -1);
        } else if (GameModel.currentScene == Scenes.ROOM) {
            this.room.update();
           if(!uiHit) this.room.checkMouseHit(this.mouseRay);
            this.shadowPassCube.setLightPos(this.room.mainLight.getWorldPos());
        } else if (GameModel.currentScene == Scenes.OUTSIDE) {
            this.outside.update()
            this.shadowPass.update(this.lightOutsidePass.sunDir, this.gameCamera.posSmooth)
            if(!uiHit)this.outside.checkMouseHit(this.mouseRay);
            this.shadowPassCube.setLightPos(this.outside.lightGrave.getWorldPos());


        }

        GameModel.update()

        if (GameModel.currentScene == Scenes.PRELOAD) {
            UI.pushWindow("Loading")
            UI.LText(this.preloader.count + "/" + this.preloader.totalCount, "loading");
            UI.popWindow()

            return;
        }
        UI.pushWindow("Game")

        this.characterHandler.onUI()
        this.outside.onUIGame();
        this.room.onUIGame();
        UI.popWindow()
        /* UI.pushWindow("Performance")
         if (!this.renderer.useTimeStampQuery) UI.LText("Enable by running Chrome with: --enable-dawn-features=allow_unsafe_apis", "", true)
         this.timeStampQuery.onUI();
         UI.popWindow()*/
        UI.pushWindow("Light")
        GameModel.dayNight = UI.LFloatSlider("dayNight", GameModel.dayNight, 0, 1);

        this.lightRoomPass.onUI();
        this.lightOutsidePass.onUI(this.shadowPass.camera.viewProjection);
        this.shadowPass.onUI()
        UI.popWindow()


        UI.pushWindow("Render Setting")
        GameModel.frustumCull = UI.LBool("frustumCull",true)
        UI.pushGroup("Performance");
        if (!this.renderer.useTimeStampQuery) UI.LText("Enable by running Chrome with: --enable-dawn-features=allow_unsafe_apis", "", true)
        this.timeStampQuery.onUI();
        UI.popGroup()

        this.canvasRenderPass.onUI();

        RenderSettings.onUI();
        UI.popWindow()

        this.drawer.onUI();

        UI.pushWindow("Objects")
        if (UI.LButton("saveData")) {
            let data = {}
            for (let m of this.renderer.models) {
                m.saveData(data)
            }
            saveToJsonFile(data, "materialData")

        }
        UI.pushGroup("UI");
        this.gameUI.onUI()
        UI.popGroup()
        UI.pushGroup("Room");
        this.room.onUI()
        UI.popGroup()
        UI.pushGroup("Outside");
        this.outside.onUI()
        UI.popGroup()
        UI.popWindow()
        if (this.renderer.selectedUIObject) {
            UI.pushWindow("Object Data")

            UI.pushID(this.renderer.selectedUIObject.label)
            this.renderer.selectedUIObject.onDataUI()
            UI.popID()
            UI.popWindow()
        }
    }

}

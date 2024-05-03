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
import GameModel, {Scenes, StateGold, UIState} from "../public/GameModel";
import GameCamera from "./GameCamera";
import Ray from "./lib/Ray";
import Drawer from "./drawing/Drawer";
import DrawingPreloader from "./drawing/DrawingPreloader";
import {saveToJsonFile} from "./lib/SaveUtils";
import OutlinePass from "./renderPasses/OutlinePass";
import MainLight from "./MainLight";
import AOPreprocessDepth from "./ComputePasses/AOPreprocessDepth";
import GTAO from "./ComputePasses/GTAO";
import GTAOdenoise from "./ComputePasses/GTAOdenoise";


import Font from "./lib/text/Font";
import TextHandler from "./TextHandler";
import SoundHandler from "./SoundHandler";
import GameUI from "./ui/GameUI";
import LightIntroRenderPass from "./renderPasses/LightIntroRenderPass";
import gsap from "gsap";
import UIData from "./UIData";
import Drawing from "./drawing/Drawing";
import Intro from "./Intro";
import {NumericArray} from "math.gl";
import Pants3D from "./extras/Pants3D";

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

    private reflectionPass: ReflectionRenderPass;
    private glassPass: GlassRenderPass;
    private blurLightPass: BlurLight;
    combinePass: CombinePass;
    private numberOfQueries: number = 11;
    private blurBloomPass: BlurBloom;
    private shadowPassCube1: ShadowCube;
    private shadowPassCube2: ShadowCube;
    private shadowPassCube3: ShadowCube;
    private shadowPassCube4: ShadowCube;
    private shadowPassCube5: ShadowCube;
    private shadowPassCube6: ShadowCube;
    private glFTLoaderChar: GLFTLoader;

    private animationMixer: AnimationMixer;
    private characterHandler: CharacterHandler;
    private room: Room;
    private outside: Outside;
    private lightOutsidePass: LightOutsideRenderPass;

    private dofPass: DOFPass;
    private postPass: PostRenderPass;
    private FXAAPass: FXAARenderPass;
    private gameCamera: GameCamera;
    private drawer: Drawer
    private drawingPreloader: DrawingPreloader;

    private outlinePass: OutlinePass;

    private aoPreCompDepth: AOPreprocessDepth;
    private gtaoPass: GTAO;
    private gtaoDenoise: GTAOdenoise;


    private font: Font;
    private shadowPass1: ShadowPass;
    private shadowPass2: ShadowPass;
    private lightIntroRenderPass: LightIntroRenderPass;
    private introLight1: MainLight;
    private introLight2: MainLight;
    private introLight3: MainLight;
    private introLight4: MainLight;
    private introDraw: Drawing;
    private loadingDraw: Drawing;
    private ctx: CanvasRenderingContext2D;
    private img: HTMLImageElement;
    private intro: Intro;
    private roomCount: number = 0;
    private outsideCount: number = 0;
    private updateShadowOutside: boolean = false;
    private pants3D: Pants3D;
    private highPerformance: boolean =true;
    private performanceCount: number =0;
    private forcePerformance: boolean =false;

    constructor(canvas: HTMLCanvasElement) {

        this.canvasManager = new CanvasManager(canvas);

        this.renderer = new Renderer()


        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

            this.showFailScreen(canvas)

            return;
        }
        UIData.init();
        this.renderer.setup(canvas).then(() => {
            this.setup()
        }).catch(() => {
            this.showFailScreen(canvas)
        })
        this.mouseListener = new MouseListener(canvas)

    }

    showFailScreen(canvas: HTMLCanvasElement) {

        this.ctx = canvas.getContext("2d");
        this.img = new Image();
        let cRatio = this.canvasManager.canvas.width / this.canvasManager.canvas.height
        if (cRatio > 1) {
            this.img.src = 'noWebgpu.jpg';
            console.log("landscape")
        } else {
            console.log("portrait")
            this.img.src = 'noWebgpuPort.jpg';
        }
        this.img.addEventListener("load", () => {
            this.tickNoWebgpu();
        });


    }

    //pre-preload
    setup() {
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
        this.glFTLoaderChar = new GLFTLoader(this.renderer, "character_animation2", this.preloader);
        this.intro = new Intro(this.renderer, this.preloader)
        this.pants3D = new Pants3D(this.renderer, this.preloader)

        new TextureLoader(this.renderer, this.preloader, "brdf_lut.png", {});
        new TextureLoader(this.renderer, this.preloader, "BlueNoise.png", {});
        new TextureLoader(this.renderer, this.preloader, "noiseTexture.png", {});

        this.introLight1 = new MainLight(this.renderer, "preloadLight1")
        this.introLight2 = new MainLight(this.renderer, "preloadLight2")
        this.introLight3 = new MainLight(this.renderer, "preloadLight3")
        this.introLight4 = new MainLight(this.renderer, "preloadLight4")
        this.font = new Font(this.renderer, this.preloader);

        this.drawingPreloader = new DrawingPreloader()
        this.drawingPreloader.load(this.renderer, this.preloader)

        GameModel.debug = UIData.debug;
        GameModel.devSpeed = UIData.devSpeed;
        //devSpeed
        if (GameModel.devSpeed) gsap.globalTimeline.timeScale(5);
    }

    startFinalPreload() {
        //
        this.preloader = new PreLoader(
            () => {
            },
            this.init.bind(this)
        );

        // this.glFTLoaderTyping = new GLFTLoader(this.renderer, "typing", this.preloader, this.glFTLoaderChar );


        this.lightRoomJson = new JSONLoader("lightRoom", this.preloader);
        GameModel.gameUI = new GameUI(this.renderer, this.preloader)

        GameModel.sound = new SoundHandler(this.preloader)
        GameModel.textHandler = new TextHandler(this.renderer, this.preloader)
        GameModel.textHandler.font = this.font;

        new TextureLoader(this.renderer, this.preloader, "WaterNormal.jpg", {});


        this.room = new Room(this.renderer, this.preloader);
        this.outside = new Outside(this.renderer, this.preloader);

        ImagePreloader.load(this.renderer, this.preloader);


        //setup passes


        this.gBufferPass = new GBufferRenderPass(this.renderer);
        this.pants3D.init()
        GameModel.pants3D = this.pants3D;
        this.aoPreCompDepth = new AOPreprocessDepth(this.renderer)
        this.gtaoPass = new GTAO(this.renderer);
        this.gtaoDenoise = new GTAOdenoise(this.renderer)

        this.shadowPassCube1 = new ShadowCube(this.renderer, null, "1");
        this.shadowPassCube2 = new ShadowCube(this.renderer, null, "2");
        this.shadowPassCube3 = new ShadowCube(this.renderer, null, "3");
        this.shadowPassCube4 = new ShadowCube(this.renderer, null, "4");
        this.shadowPassCube5 = new ShadowCube(this.renderer, null, "5");
        this.shadowPassCube6 = new ShadowCube(this.renderer, null, "6");
        this.shadowPass1 = new ShadowPass(this.renderer, 1);
        this.shadowPass2 = new ShadowPass(this.renderer, 2);
        // this.aoPass = new AORenderPass(this.renderer);
        //this.aoBlurPass = new AOBlurRenderPass(this.renderer);
        this.lightIntroRenderPass = new LightIntroRenderPass(this.renderer)
        this.lightRoomPass = new LightRenderPass(this.renderer, this.lightIntroRenderPass.target);
        this.lightOutsidePass = new LightOutsideRenderPass(this.renderer, this.lightIntroRenderPass.target);
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


        GameModel.textHandler.fontMeshRenderer = this.canvasRenderPass.fontMeshRenderer


        GameModel.main = this;
        GameModel.renderer = this.renderer;
        GameModel.outlinePass = this.outlinePass;
        GameModel.gameCamera = this.gameCamera;
        GameModel.lightOutsidePass = this.lightOutsidePass
        this.lightIntroRenderPass.init([this.introLight1, this.introLight2, this.introLight3, this.introLight4])


//init char
        this.animationMixer = new AnimationMixer()
        this.animationMixer.setAnimations(this.glFTLoaderChar.animations)
        GameModel.animationMixer = this.animationMixer;

        this.characterHandler = new CharacterHandler(this.renderer, this.camera, this.glFTLoaderChar, this.animationMixer)

        GameModel.characterHandler = this.characterHandler;
        this.intro.init(this.glFTLoaderChar)
        this.glassPass.modelRenderer = this.intro.modelRendererTrans;

        this.gBufferPass.modelRenderer = this.intro.modelRenderer;


        this.drawer = new Drawer(this.renderer);
        this.dofPass.init();
        this.outlinePass.init();
        RenderSettings.ao = this.gtaoPass;
        RenderSettings.onChange();

        this.shadowPassCube1.setModels(this.gBufferPass.modelRenderer.models);
        this.shadowPassCube1.setLightPos(this.introLight1.getWorldPos())

        this.shadowPassCube2.setModels(this.gBufferPass.modelRenderer.models);
        this.shadowPassCube2.setLightPos(this.introLight2.getWorldPos())


        this.shadowPassCube3.setModels(this.gBufferPass.modelRenderer.models);
        this.shadowPassCube3.setLightPos(this.introLight3.getWorldPos())


        this.shadowPassCube4.setModels(this.gBufferPass.modelRenderer.models);
        this.shadowPassCube4.setLightPos(this.introLight4.getWorldPos())


        this.gBufferPass.drawingRenderer.addDrawing(this.drawer.drawing)
        for (let d of this.drawingPreloader.drawings) {
            d.resolveParent();

            this.gBufferPass.drawingRenderer.addDrawing(d)
            if (d.label == "drawings/intro_world.bin") {
                d.showIntro();
                this.introDraw = d;
                GameModel.introDraw = d;
            }

            this.loadingDraw = d;


        }


        //  this.intro.modelRenderer.addModel(this.pants3D.pants)


        this.tick()
        RenderSettings.fadeToScreen(1)
    }

    setScene(scene: Scenes) {
        if (scene == Scenes.PRELOAD) {


            GameModel.roomCamOffset = 0;
            GameModel.isLeftRoom = false;

            // public floorHitIndicator: FloorHitIndicator;
            GameModel.yMouseCenter = 1;
            GameModel.yMouseScale = 1;
            GameModel.sceneHeight = 2.5;

            this.lightIntroRenderPass.setDirty();
            this.gBufferPass.modelRenderer = this.intro.modelRenderer
            this.glassPass.modelRenderer = this.intro.modelRendererTrans;

            this.shadowPassCube1.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube1.setLightPos(this.introLight1.getWorldPos())

            this.shadowPassCube2.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube2.setLightPos(this.introLight2.getWorldPos())


            this.shadowPassCube3.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube3.setLightPos(this.introLight3.getWorldPos())


            this.shadowPassCube4.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube4.setLightPos(this.introLight4.getWorldPos())

        }
        if (scene == Scenes.ROOM) {
            this.roomCount = 0;
            GameModel.yMouseScale = 1
            GameModel.yMouseCenter = 1
            GameModel.sceneHeight = 3
            this.gBufferPass.drawingRenderer.currentScene = 0;
            this.gBufferPass.modelRenderer = this.room.modelRenderer;
            this.glassPass.modelRenderer = this.room.modelRendererTrans;
            this.lightRoomPass.setDirty();
            this.characterHandler.setRoot(this.room.root, 0);
            this.shadowPassCube1.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube1.setLightPos(this.room.lightKitchen.getWorldPos())

            this.shadowPassCube2.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube2.setLightPos(this.room.lightLab.getWorldPos())

            this.shadowPassCube3.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube3.setLightPos(this.room.lightDoor.getWorldPos())

            this.shadowPassCube4.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube4.setLightPos(this.room.lightWall.getWorldPos())

            this.shadowPassCube5.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube5.setLightPos(this.room.lightWallLiving.getWorldPos())

            this.shadowPassCube6.setModels(this.gBufferPass.modelRenderer.models);
            this.shadowPassCube6.setLightPos(this.room.lightTable.getWorldPos())

//1,5,6 living
            //2,3,4 work
            RenderSettings.exposure = 1.6;
            RenderSettings.onChange()

        } else if (scene == Scenes.OUTSIDE) {
            this.outsideCount = 0;
            GameModel.yMouseScale = 1.5
            GameModel.yMouseCenter = 0
            GameModel.sceneHeight = 2.5


            this.gBufferPass.drawingRenderer.currentScene = 1;
            this.gameCamera.setOutsidePos();
            this.gBufferPass.modelRenderer = this.outside.modelRenderer;
            this.glassPass.modelRenderer = this.outside.modelRendererTrans;
            this.lightOutsidePass.setDirty();
            this.characterHandler.setRoot(this.outside.root, 1);
            this.shadowPass1.setModels(this.outside.modelRenderer.models);
            this.shadowPass2.setModels(this.outside.modelRenderer.models);
            this.shadowPassCube1.setModels(this.outside.modelRenderer.models);
            this.shadowPassCube1.setLightPos(this.outside.lightGrave.getWorldPos())
            RenderSettings.exposure = 1.2;
            RenderSettings.onChange()
        }


    }

    init() {

        this.intro.setNewTextures()
        GameModel.room = this.room;
        GameModel.outside = this.outside;

        this.room.init()
        this.outside.init();
        GameModel.init();
        GameModel.makeTriggers();


        this.lightRoomPass.init(this.lightRoomJson.data, [this.room.lightKitchen, this.room.lightLab, this.room.lightDoor, this.room.lightWall, this.room.lightWallLiving, this.room.lightTable], [this.room.leftHolder, this.room.rightHolder, this.room.centerHolder])
        this.lightOutsidePass.init();


        this.room.makeTransParent();
        this.outside.makeTransParent();
        this.lightOutsidePass.lightGrave = this.outside.lightGrave;


        this.shadowPass1.init();
        this.shadowPass2.init();
        for (let m of this.intro.modelsRoom) {
            //this.gBufferPass.modelRenderer.addModel(m)

            this.room.modelRenderer.addModel(m)

        }
        for (let m of this.intro.modelsOutside) {
            //this.gBufferPass.modelRenderer.addModel(m)

            this.outside.modelRenderer.addModel(m)


        }
        this.loadingDraw.hideLoad();

        GameModel.setUIState(UIState.PRELOAD_DONE)

    }

    tick() {

        window.requestAnimationFrame(() => this.tick());
        if (GameModel.mousePos.equals(this.mouseListener.mousePos as NumericArray)) {
            GameModel.mouseMove = false;
        } else {
            GameModel.mouseMove = true;
        }
        if (UI.needsMouse()) {

            this.mouseListener.isDownThisFrame = false;
        }

        GameModel.mousePos.from(this.mouseListener.mousePos);//.clone();
        GameModel.mouseDownThisFrame = this.mouseListener.isDownThisFrame;
        GameModel.mouseUpThisFrame = this.mouseListener.isUpThisFrame;
        Timer.update();
        this.updateSceneHeight()

        this.update();
        UI.updateGPU();
        this.renderer.update(this.onDraw.bind(this));
        this.timeStampQuery.getData();
        this.mouseListener.reset()

    }

    update() {


        if (!GameModel.lockView) {

            this.gameCamera.update();

        }
        let checkHit = !UI.needsMouse();
        if (GameModel.catchMouseDown) {
            checkHit = false

        }
        if (GameModel.uiOpen) {
            checkHit = false

        }
        if (!GameModel.mouseMove && !GameModel.mouseDownThisFrame) {
            // checkHit =false

        }

        if (checkHit) this.mouseRay.setFromCamera(this.camera, this.mouseListener.mousePos)
        if (!GameModel.lockView) this.characterHandler.update()

        if (this.drawer.enabled) this.drawer.setMouseData(this.mouseListener.isDownThisFrame, this.mouseListener.isUpThisFrame, this.mouseRay)
        for (let d of this.drawingPreloader.drawings) {
            d.update()
        }
        GameModel.update()
        this.pants3D.update();
        if (GameModel.currentScene == Scenes.PRELOAD) {
            this.intro.update();
            this.shadowPassCube1.setLightPos(this.introLight1.getWorldPos());
            this.shadowPassCube2.setLightPos(this.introLight2.getWorldPos());
            this.shadowPassCube3.setLightPos(this.introLight3.getWorldPos());
            this.shadowPassCube4.setLightPos(this.introLight4.getWorldPos());

            GameModel.characterPos.set(-1, -1.2, -1);
            if (this.introDraw.progress > 0.99) {
                this.loadingDraw.progress += (this.preloader.getProgress() - this.loadingDraw.progress) * 0.05;
            }

        } else if (GameModel.currentScene == Scenes.ROOM) {
            this.room.update();
            if (checkHit) this.room.checkMouseHit(this.mouseRay);
            this.shadowPassCube1.setLightPos(this.room.lightKitchen.getWorldPos());
            this.shadowPassCube2.setLightPos(this.room.lightLab.getWorldPos());
            this.shadowPassCube3.setLightPos(this.room.lightDoor.getWorldPos())
            this.shadowPassCube4.setLightPos(this.room.lightWall.getWorldPos())
            this.shadowPassCube5.setLightPos(this.room.lightWallLiving.getWorldPos())
            this.shadowPassCube6.setLightPos(this.room.lightTable.getWorldPos())
            this.lightRoomPass.setUniforms()
            // RenderSettings.onChange()
        } else if (GameModel.currentScene == Scenes.OUTSIDE) {
            this.outside.update()
            this.shadowPass1.update(this.lightOutsidePass.sunDir, this.gameCamera.posSmooth)
            if (this.outsideCount % 2 == 0) {
                this.shadowPass2.update(this.lightOutsidePass.sunDir, this.gameCamera.posSmooth)
                this.updateShadowOutside = true
                this.lightOutsidePass.setUniforms2(this.shadowPass2.camera.viewProjection);
            }
            if (checkHit) this.outside.checkMouseHit(this.mouseRay);
            this.shadowPassCube1.setLightPos(this.outside.lightGrave.getWorldPos());

            this.lightOutsidePass.setUniforms(this.shadowPass1.camera.viewProjection)
            //RenderSettings.onChange()
        }

        if(Timer.fps<30 && this.highPerformance){
           this.performanceCount++;
         if(this.performanceCount>100){
             this.highPerformance =false;
             this.renderer.setLowPerformance();
                      }
        }else {
            this.performanceCount =0;
        }
        if (GameModel.debug)
            this.updateUI();


    }

    updateUI() {

        UI.pushWindow("Dev Settings")
        // UI.LFloatSlider(GameModel,"offsetY",-5,1)
        //UI.LFloatSlider(GameModel,"sceneHeight",2,5)
        //GameModel.textHandler.onUI()

        this.canvasRenderPass.onUI();
        let speed = UI.LBool("Go fast", GameModel.devSpeed);
        if (speed != GameModel.devSpeed) {
            GameModel.devSpeed = speed;
            UIData.devSpeed = speed;
            if (GameModel.devSpeed) {
                gsap.globalTimeline.timeScale(5);
            } else {
                gsap.globalTimeline.timeScale(1);
            }
        }
        if(this.highPerformance || this.forcePerformance ){
            UI.LText('HIGH',"Performance")
        }else{
            UI.LText('LOW',"Performance")
            if (UI.LButton("Force HIGH performance")) {
                this.highPerformance =false;
                this.forcePerformance =true;
                this.renderer.setHighPerformance();
            }
        }


        if (UI.LButton("Hide Dev windows")) {
            GameModel.debug = false;
            UIData.debug = false;
            GameModel.gameUI.menu.checkBtn.select(false)
        }

        if (UI.LButton("Clear local storage")) {
            localStorage.removeItem("devData");
            UI.clearLocalData();
        }
      //  UI.LVector("temp1", GameModel.temp1);
       // UI.LVector("temp2", GameModel.temp2);
       // UI.LColor("tempC", GameModel.tempC);
        UI.separator("Windows");

        UIData.performance = (UI.LBool("Preformance", UIData.performance));
        UIData.gameState = UI.LBool("Game State", UIData.gameState);
        UIData.renderSettings = UI.LBool("Render Settings", UIData.renderSettings)
        UIData.lightInside = UI.LBool("Light Inside", UIData.lightInside)
        UIData.lightOutside = UI.LBool("Light Outside", UIData.lightOutside)
        UIData.sceneObjects = UI.LBool("Scene Objects", UIData.sceneObjects)
        UIData.work = UI.LBool("Work", UIData.work)
        UIData.face = UI.LBool("Face", UIData.face)
        UIData.animation = UI.LBool("Animations", UIData.animation)
        UIData.draw = UI.LBool("Draw", UIData.draw)

        UI.separator("Info");
        if (UI.LButton("Check on Github")) {
            window.open("https://github.com/neuroprod/webgpu", '_blank');
        }

        UI.popWindow()
//
        if (UIData.face) this.characterHandler.face.onUI();
        //draw
        if (UIData.work) this.pants3D.onUI()
        if (UIData.draw) this.drawer.onUI()

//animation
        if (UIData.animation) this.animationMixer.onUI()
        //performance
        if (UIData.performance) {
            UI.pushWindow("Performance")
            UI.LText(Timer.fps + "", "FPS")
            UI.LText(GameModel.screenWidth + " " + GameModel.screenHeight, "Render Size");
            UI.LText(GameModel.drawCount + "", "Num Models")
            if (!this.renderer.useTimeStampQuery) UI.LText("Enable by running Chrome with: --enable-dawn-features=allow_unsafe_apis and check the box below, and refresh", "GPU Time stamps", true)
            if (!this.renderer.useTimeStampQuery) UI.LText("Warning! it will crash the site if you refresh when you not enabled it in Chrome. Clear local storage to fix it", "Don't touch", true)

            UIData.useTimestamp = UI.LBool("Use Timestamp", UIData.useTimestamp)

            this.timeStampQuery.onUI();
            UI.popWindow()
        }
        //gameState
        if (UIData.gameState && GameModel.currentScene != Scenes.PRELOAD) {
            GameModel.onUI();
        }
        //gameRender
        if (UIData.renderSettings && GameModel.currentScene != Scenes.PRELOAD) {
            UI.pushWindow("Render Settings")
            if (UI.LButton("log unused textures")) {
                console.log("-----------------------")
                for (let t of this.renderer.textures) {
                    if (t.useCount < 2) console.log(t.label)
                }
            }
            GameModel.textHandler.onUI();
            GameModel.frustumCull = UI.LBool("frustumCull", true)

            RenderSettings.onUI();
            UI.popWindow()
        }
        if (UIData.lightInside && GameModel.currentScene != Scenes.PRELOAD) {
            UI.pushWindow("Light Inside")
            this.lightRoomPass.onUI();
            UI.popWindow()
        }
        if (UIData.lightOutside && GameModel.currentScene != Scenes.PRELOAD) {
            UI.pushWindow("Light Outside")
            this.shadowPass1.onUI()
            this.shadowPass2.onUI()
            this.lightOutsidePass.onUI();
            UI.popWindow()
        }
        //objects
        if (UIData.sceneObjects && GameModel.currentScene != Scenes.PRELOAD) {
            UI.pushWindow("Scene Objects")
            if (UI.LButton("saveData")) {
                let data = {}
                for (let m of this.renderer.models) {

                    m.saveData(data)
                }
                saveToJsonFile(data, "materialData")

            }

            UI.pushGroup("Room");
            this.room.onUI()
            UI.popGroup()
            UI.pushGroup("Outside");
            this.outside.onUI()
            UI.popGroup()
            UI.popWindow()
//detail
            if (this.renderer.selectedUIObject) {
                UI.pushWindow("Object Data")

                UI.pushID(this.renderer.selectedUIObject.label)
                this.renderer.selectedUIObject.onDataUI()
                UI.popID()
                UI.popWindow()
            }
        }
    }

    onDraw() {

        GameModel.drawCount = 0;

        this.timeStampQuery.start();
        if (GameModel.currentScene == Scenes.PRELOAD) {

            this.shadowPassCube1.add();
            this.shadowPassCube2.add();
            this.shadowPassCube3.add();
            this.shadowPassCube4.add();
            this.shadowPassCube5.add();
            this.shadowPassCube6.add();

        } else if (GameModel.currentScene == Scenes.ROOM) {


            this.roomCount++;
            this.shadowPassCube1.add();

            if (GameModel.roomCamOffset < 0.99 || this.roomCount < 6) {

                this.shadowPassCube5.add();
                this.shadowPassCube6.add();
            }
            if (GameModel.roomCamOffset > -0.99 || this.roomCount < 6) {
                this.shadowPassCube2.add();
                this.shadowPassCube3.add();
                this.shadowPassCube4.add();
            }


        } else if (GameModel.currentScene == Scenes.OUTSIDE) {

            this.shadowPass1.add();
            if (GameModel.dayNight == 0) {
                this.shadowPass1.add();
                if (this.updateShadowOutside == true) {
                    this.shadowPass2.add();
                    this.updateShadowOutside = false;
                }
            } else {
                this.shadowPass1.add();
                this.shadowPassCube1.add();
            }
            this.outsideCount++;

        }
        if (GameModel.compVisible) {
            this.pants3D.pantsRenderPass.add();
        }
        this.timeStampQuery.setStamp("ShadowPass");
        this.gBufferPass.add();
        this.timeStampQuery.setStamp("GBufferPass");

        this.aoPreCompDepth.add();
        this.gtaoPass.add();
        this.gtaoDenoise.add();

        this.timeStampQuery.setStamp("AOPass");
        if (GameModel.currentScene == Scenes.PRELOAD) {
            this.lightIntroRenderPass.add();
        } else if (GameModel.currentScene == Scenes.ROOM) {
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

    private tickNoWebgpu() {
        let cRatio = this.canvasManager.canvas.width / this.canvasManager.canvas.height
        let iRatio = this.img.width / this.img.height

        let h = this.canvasManager.canvas.height;
        let w = this.canvasManager.canvas.height * iRatio;


        if (iRatio < cRatio) {
            h = this.canvasManager.canvas.width / iRatio;
            w = this.canvasManager.canvas.width;

        }
        let offX = (this.canvasManager.canvas.width - w) / 2;
        let offY = (this.canvasManager.canvas.height - h) / 2;
        this.ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height,
            offX, offY, w, h);

        window.requestAnimationFrame(() => this.tickNoWebgpu());
    }

    private updateSceneHeight() {
        if (GameModel.stateGold == StateGold.GET_GOLD) {
            GameModel.sceneHeight = 2.5;
        }
        if (GameModel.currentScene == Scenes.ROOM) {
            let sw = this.renderer.ratio * 3;

            if (sw < GameModel.minRoomSize) {
                GameModel.sceneHeight = GameModel.minRoomSize / this.renderer.ratio;
            } else {
                GameModel.sceneHeight = 3;
            }

        } else if (GameModel.currentScene == Scenes.OUTSIDE) {


            let dist = Math.min(Math.max((Math.abs(GameModel.characterPos.x + 12) - 2) / 10, 0), 1) * 0.7;

            GameModel.sceneHeight += (4.1 - dist - GameModel.sceneHeight) / 50;

        }
    }


}

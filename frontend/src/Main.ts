import CanvasManager from "./lib/CanvasManager";
import Renderer from "./lib/Renderer";


import PreLoader from "./lib/PreLoader";

import Camera from "./lib/Camera";
import GLFTLoader from "./GLFTLoader";

import ImagePreloader from "./ImagePreloader";
import {Vector2, Vector3} from "math.gl";
import MouseListener from "./lib/MouseListener";
import CanvasRenderPass from "./renderPasses/CanvasRenderPass";
import TimeStampQuery from "./lib/TimeStampQuery";
import UI from "./lib/UI/UI";
import GBufferRenderPass from "./renderPasses/GBufferRenderPass";
import Timer from "./lib/Timer";
import LightRenderPass from "./renderPasses/LightRenderPass";

import JSONLoader from "./JSONLoader";
import AORenderPass from "./renderPasses/AORenderPass";
import AOBlurRenderPass from "./renderPasses/AOBlurRenderPass";
import ReflectionRenderPass from "./renderPasses/ReflectionRenderPass";
import TextureLoader from "./lib/loaders/TextureLoader";
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


export default class Main {
    private canvasManager: CanvasManager;
    private renderer: Renderer;

    private mouseListener: MouseListener

    private preloader: PreLoader;
    private camera: Camera;


    private mouseTarget = new Vector2()


    private canvasRenderPass: CanvasRenderPass
    private gBufferPass: GBufferRenderPass;
    private timeStampQuery: TimeStampQuery;
    private lightPass: LightRenderPass;

    private lightJson: JSONLoader;
    private aoPass: AORenderPass;
    private aoBlurPass: AOBlurRenderPass;
    private reflectionPass: ReflectionRenderPass;
    private glassPass: GlassRenderPass;
    private blurLightPass: BlurLight;

    private combinePass: CombinePass;
    private numberOfQueries: number = 10;
    private blurBloomPass: BlurBloom;


    private shadowPass: ShadowCube;


    private glFTLoaderChar: GLFTLoader;
    //private transformDebugger: TransformDebugger;
    private animationMixer: AnimationMixer;
    private characterHandler: CharacterHandler;

    private sceneHeight = 3;
    private room: Room;
    private outside: Outside;
    private sceneIndex: number = 0
    private yMouseCenter: number = 1;
    private yMouseScale: number = 1;

    constructor(canvas: HTMLCanvasElement) {

        this.canvasManager = new CanvasManager(canvas);
        this.renderer = new Renderer()
        this.renderer.setup(canvas).then(() => {
            this.setup()
        })
        this.mouseListener = new MouseListener(canvas)
    }

    public setup() {
        this.preloader = new PreLoader(
            this.loadProgress.bind(this),
            this.init.bind(this)
        );

        this.renderer.init()
        this.timeStampQuery = new TimeStampQuery(this.renderer, this.numberOfQueries)


        this.camera = new Camera(this.renderer, "mainCamera")
        this.renderer.camera = this.camera;

        this.room = new Room(this.renderer, this.preloader);
        this.outside = new Outside(this.renderer, this.preloader);

        new TextureLoader(this.renderer, this.preloader, "brdf_lut.png", {});

        ImagePreloader.load(this.renderer, this.preloader);


        this.glFTLoaderChar = new GLFTLoader(this.renderer, "character_animation", this.preloader);
        this.lightJson = new JSONLoader("light", this.preloader);
        UI.setWebGPU(this.renderer)

    }

    onDraw() {
        this.timeStampQuery.start();
        this.shadowPass.add();
        this.timeStampQuery.setStamp("ShadowPass");
        this.gBufferPass.add();
        this.timeStampQuery.setStamp("GBufferPass");
        this.aoPass.add();
        this.aoBlurPass.add();
        this.timeStampQuery.setStamp("AOPass");
        this.lightPass.add();
        this.timeStampQuery.setStamp("LightPass");
        this.blurLightPass.add()
        this.timeStampQuery.setStamp("blurLight");
        this.reflectionPass.add()
        this.timeStampQuery.setStamp("ReflectionPass");
        this.glassPass.add();
        this.timeStampQuery.setStamp("GlassPass");
        this.combinePass.add()
        this.timeStampQuery.setStamp("CombinePass");
        this.blurBloomPass.add();
        this.timeStampQuery.setStamp("BlurBloomPass");
        this.canvasRenderPass.add();
        this.timeStampQuery.setStamp("CanvasPass");
        this.timeStampQuery.stop();
    }

    public setScene(id: number) {
        this.sceneIndex = id;
        if (id == 0) {
            this.yMouseScale = 1
            this.yMouseCenter = 1
            this.sceneHeight = 3
            this.gBufferPass.modelRenderer = this.room.modelRenderer;
            this.glassPass.modelRenderer = this.room.modelRendererTrans;

            this.characterHandler.setRoot(this.room.root);
        } else {
            this.yMouseScale = 1.5
            this.yMouseCenter = 0
            this.sceneHeight = 4
            this.gBufferPass.modelRenderer = this.outside.modelRenderer;
            this.glassPass.modelRenderer = this.outside.modelRendererTrans;

            this.characterHandler.setRoot(this.outside.root);
        }

        this.shadowPass.setModels(this.gBufferPass.modelRenderer.models);
    }

    updateCamera() {
        let mp = this.mouseListener.mousePos.clone()
        mp.scale(new Vector2(1 / (this.renderer.width / this.renderer.pixelRatio), 1 / (this.renderer.height / this.renderer.pixelRatio)))

        mp.x -= 0.5
        mp.x *= 2.0;

        mp.y -= 0.5
        mp.y *= this.yMouseScale;

        this.mouseTarget.lerp(mp, 0.1);
        let cameraPositionMap = new Vector3(-this.mouseTarget.x * 2.0, this.yMouseCenter + this.mouseTarget.y, 10);
        this.camera.cameraWorld = cameraPositionMap.clone();
        this.camera.cameraLookAt = new Vector3(cameraPositionMap.x, cameraPositionMap.y, 0);
        let screenLocal = new Vector2(this.renderer.ratio * this.sceneHeight, this.sceneHeight)

        this.camera.fovy = Math.atan2(screenLocal.y / 2, cameraPositionMap.z) * 2;

        this.camera.ratio = this.renderer.ratio;

        this.camera.lensShift.x = -cameraPositionMap.x / (screenLocal.x / 2);
        this.camera.lensShift.y = -cameraPositionMap.y / (screenLocal.y / 2);
    }

    private loadProgress() {

    }

    private init() {


        this.gBufferPass = new GBufferRenderPass(this.renderer)
        this.room.init()
        this.outside.init();
        this.shadowPass = new ShadowCube(this.renderer)
        this.aoPass = new AORenderPass(this.renderer)
        this.aoBlurPass = new AOBlurRenderPass(this.renderer);

        this.lightPass = new LightRenderPass(this.renderer, this.lightJson.data, this.room.mainLight, [this.room.leftHolder, this.room.rightHolder, this.room.centerRightHolder]);

        this.blurLightPass = new BlurLight(this.renderer);
        this.reflectionPass = new ReflectionRenderPass(this.renderer);
        this.glassPass = new GlassRenderPass(this.renderer)
        this.combinePass = new CombinePass(this.renderer)
        this.blurBloomPass = new BlurBloom(this.renderer)

        this.canvasRenderPass = new CanvasRenderPass(this.renderer);
        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment)

        this.room.makeTransParent();
        this.outside.makeTransParent();
        //this.gBufferPass.modelRenderer =this.outside.modelRenderer;


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


        this.setScene(0);

        this.tick()
    }

    private tick() {

        window.requestAnimationFrame(() => this.tick());

        Timer.update();
        this.update();
        UI.updateGPU();
        this.renderer.update(this.onDraw.bind(this));
        this.timeStampQuery.getData();
        // console.log(this.timeStampQuery.timeArray, this.timeStampQuery.names, this.timeStampQuery.totalTime)
    }

    private update() {


        this.characterHandler.update(this.mouseListener.mousePos.clone(), this.mouseListener.isDownThisFrame)


        this.updateCamera();
        if (this.sceneIndex == 0) {
            this.room.update();
        } else {
            this.outside.update()
        }


        this.shadowPass.setLightPos(this.room.mainLight.getWorldPos());

        UI.pushWindow("Performance")
        if (!this.renderer.useTimeStampQuery) UI.LText("Enable by running Chrome with: --enable-dawn-features=allow_unsafe_apis", "", true)
        this.timeStampQuery.onUI();
        UI.popWindow()

        this.lightPass.onUI();

        UI.pushWindow("Render Setting")
        this.canvasRenderPass.onUI();
        UI.pushGroup("AO");
        this.aoPass.onUI();
        UI.popGroup()
        RenderSettings.onUI();
        UI.popWindow()

        UI.pushWindow("Scenes")
        if (UI.LButton("Inside")) {
            this.setScene(0);
        }
        if (UI.LButton("Outside")) {
            this.setScene(1);
        }
        UI.popWindow()
        this.mouseListener.reset()
    }

}

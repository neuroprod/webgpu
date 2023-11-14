import CanvasManager from "./lib/CanvasManager";
import Renderer from "./lib/Renderer";


import PreLoader from "./lib/PreLoader";

import Camera from "./lib/Camera";
import GLFTLoader from "./lib/loaders/GLFTLoader";

import ImagePreloader from "./ImagePreloader";
import {Vector2, Vector3} from "math.gl";
import MouseListener from "./lib/MouseListener";
import Object3D from "./lib/core/Object3D";
import CanvasRenderPass from "./CanvasRenderPass";
import TimeStampQuery from "./lib/TimeStampQuery";
import UI from "./UI/UI";


export default class Main {
    private canvasManager: CanvasManager;
    private renderer: Renderer;

    private mouseListener: MouseListener

    private preloader: PreLoader;
    private camera: Camera;
    private glFTLoader: GLFTLoader;

    private mouseTarget = new Vector2()
    private leftHolder: Object3D;
    private rightHolder: Object3D;

    private mainRenderPass: CanvasRenderPass
    private timeStampQuery: TimeStampQuery;

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
        this.timeStampQuery = new TimeStampQuery(this.renderer, 2)
        this.camera = new Camera(this.renderer, "mainCamera")
        this.renderer.camera = this.camera;
        ImagePreloader.load(this.renderer, this.preloader);
        this.glFTLoader = new GLFTLoader(this.renderer, "roomFinal", this.preloader);
        UI.setWebGPU(this.renderer)

    }


    private loadProgress() {

    }

    private init() {
        this.mainRenderPass = new CanvasRenderPass(this.renderer);
        this.renderer.setCanvasColorAttachment(this.mainRenderPass.canvasColorAttachment)

        this.glFTLoader.root.setPosition(0, -1.5, 0)
        this.leftHolder = this.glFTLoader.objectsByName["left"]
        this.rightHolder = this.glFTLoader.objectsByName["right"]
        for (let m of this.glFTLoader.models) {
            this.mainRenderPass.modelRenderer.addModel(m)

        }

        this.tick()
    }
    private tick() {

        window.requestAnimationFrame(() => this.tick());


        this.update();
        UI.updateGPU();
        this.renderer.update(this.onDraw.bind(this));
        this.timeStampQuery.getData();
        // console.log(this.timeStampQuery.timeArray, this.timeStampQuery.names, this.timeStampQuery.totalTime)
    }
    private update() {
        this.leftHolder.setPosition(-this.renderer.ratio * 3 / 2, 0, 0)
        this.rightHolder.setPosition(this.renderer.ratio * 3 / 2, 0, 0)
        this.glFTLoader.root.setPosition(0, -1.5, 0)

        let mp = this.mouseListener.mousePos.clone()
        mp.scale(new Vector2(1 / this.renderer.width, 1 / this.renderer.height))
        mp.x -= 0.5
        mp.y -= 0.5
        mp.y *= 2.0
        this.mouseTarget.lerp(mp, 0.1);
        let cameraPositionMap = new Vector3(-this.mouseTarget.x * 2.0, 1.5 + this.mouseTarget.y, 7);
        this.camera.cameraWorld = cameraPositionMap.clone();
        this.camera.cameraLookAt = new Vector3(cameraPositionMap.x, cameraPositionMap.y, 0);
        let screenLocal = new Vector2(this.renderer.ratio * 3, 3)

        this.camera.fovy = Math.atan2(screenLocal.y / 2, cameraPositionMap.z) * 2;


        this.camera.lensShift.x = -cameraPositionMap.x / (screenLocal.x / 2);
        this.camera.lensShift.y = -cameraPositionMap.y / (screenLocal.y / 2);
        this.camera.isDirty = true;
        UI.pushWindow("test")
        UI.LText("hello");
        UI.popWindow()
    }
    onDraw() {
        this.timeStampQuery.start()//
        this.mainRenderPass.add()
        this.timeStampQuery.setStamp("mainPass")
        this.timeStampQuery.setStamp("test")
        this.timeStampQuery.stop()
    }




}

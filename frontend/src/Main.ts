import CanvasManager from "./lib/CanvasManager";
import Renderer from "./lib/Renderer";


import PreLoader from "./lib/PreLoader";

import Camera from "./lib/Camera";
import GLFTLoader from "./GLFTLoader";

import ImagePreloader from "./ImagePreloader";
import {Vector2, Vector3} from "math.gl";
import MouseListener from "./lib/MouseListener";
import Object3D from "./lib/core/Object3D";
import CanvasRenderPass from "./CanvasRenderPass";
import TimeStampQuery from "./lib/TimeStampQuery";
import UI from "./lib/UI/UI";
import GBufferRenderPass from "./GBufferRenderPass";
import Timer from "./lib/Timer";
import LightRenderPass from "./LightRenderPass";
import PostRenderPass from "./PostRenderPass";
import JSONLoader from "./JSONLoader";
import AORenderPass from "./AORenderPass";
import AOBlurRenderPass from "./AOBlurRenderPass";
import ReflectionRenderPass from "./ReflectionRenderPass";
import TextureLoader from "./lib/loaders/TextureLoader";
import GlassRenderPass from "./GlassRenderPass";
import BlurLight from "./BlurLight";


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

    private canvasRenderPass: CanvasRenderPass
    private gBufferPass: GBufferRenderPass;
    private timeStampQuery: TimeStampQuery;
    private lightPass: LightRenderPass;
    private postPass: PostRenderPass;
    private lightJson: JSONLoader;
    private aoPass: AORenderPass;
    private aoBlurPass: AOBlurRenderPass;
    private reflectionPass: ReflectionRenderPass;
    private glassPass: GlassRenderPass;
    private blurLightPass: BlurLight;


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
        this.timeStampQuery = new TimeStampQuery(this.renderer, 8)


        this.camera = new Camera(this.renderer, "mainCamera")
        this.renderer.camera = this.camera;
        new TextureLoader(this.renderer,this.preloader,"brdf_lut.png",{});
        ImagePreloader.load(this.renderer, this.preloader);

        this.glFTLoader = new GLFTLoader(this.renderer, "roomFinal", this.preloader);
        this.lightJson = new JSONLoader("light", this.preloader);
        UI.setWebGPU(this.renderer)

    }



    private loadProgress() {

    }

    private init() {


        this.gBufferPass = new GBufferRenderPass(this.renderer)
        this.aoPass = new AORenderPass(this.renderer)
        this.aoBlurPass = new AOBlurRenderPass(this.renderer);
        this.lightPass = new LightRenderPass(this.renderer, this.lightJson.data);
        this.blurLightPass =new BlurLight(this.renderer);
        this.reflectionPass = new ReflectionRenderPass(this.renderer);
        this.glassPass =new GlassRenderPass(this.renderer)
        this.postPass = new PostRenderPass(this.renderer)


        this.canvasRenderPass = new CanvasRenderPass(this.renderer);

        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment)


        this.glFTLoader.root.setPosition(0, -1.5, 0)
        this.leftHolder = this.glFTLoader.objectsByName["left"]
        this.rightHolder = this.glFTLoader.objectsByName["right"]


        for (let m of this.glFTLoader.models) {
            this.gBufferPass.modelRenderer.addModel(m)

        }
        for (let m of this.glFTLoader.modelsGlass) {

            m.material.uniforms.setTexture("gDepth",this.renderer.texturesByLabel["GDepth"])
            m.material.uniforms.setTexture("background",this.renderer.texturesByLabel["LightPass"])
            this.glassPass.modelRenderer.addModel(m)

        }
        this.tick()
    }
    onDraw() {
        this.timeStampQuery.start();
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
        this.postPass.add()
        this.timeStampQuery.setStamp("PostPass");
        this.canvasRenderPass.add();
        this.timeStampQuery.setStamp("CanvasPass");
        this.timeStampQuery.stop();
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
        this.leftHolder.setPosition(-this.renderer.ratio * 3 / 2, 0, 0)
        this.rightHolder.setPosition(this.renderer.ratio * 3 / 2, 0, 0)
        this.glFTLoader.root.setPosition(0, -1.5, 0)

        let mp = this.mouseListener.mousePos.clone()
        mp.scale(new Vector2(1 / this.renderer.width, 1 / this.renderer.height))
        mp.x -= 0.5
        mp.x*=2.0;
        mp.y -= 0.5
        mp.y *= 3.0
        this.mouseTarget.lerp(mp, 0.1);
        let cameraPositionMap = new Vector3(-this.mouseTarget.x * 2.0, 2.0 + this.mouseTarget.y, 10);
        this.camera.cameraWorld = cameraPositionMap.clone();
        this.camera.cameraLookAt = new Vector3(cameraPositionMap.x, cameraPositionMap.y, 0);
        let screenLocal = new Vector2(this.renderer.ratio * 3, 3)

        this.camera.fovy = Math.atan2(screenLocal.y / 2, cameraPositionMap.z) * 2;


        this.camera.lensShift.x = -cameraPositionMap.x / (screenLocal.x / 2);
        this.camera.lensShift.y = -cameraPositionMap.y / (screenLocal.y / 2);

        UI.pushWindow("Render Setting")
        this.postPass.onUI();
        this.aoPass.onUI();
        this.reflectionPass.onUI();
        UI.popWindow()


        this.lightPass.onUI();


        UI.pushWindow("Debug/Performance")
        this.canvasRenderPass.onUI();
        Timer.onUI()
        this.timeStampQuery.onUI();
        UI.popWindow()
    }


}

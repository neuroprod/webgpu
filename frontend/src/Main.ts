import CanvasManager from "./lib/CanvasManager";
import Renderer from "./lib/Renderer";


import PreLoader from "./lib/PreLoader";

import Camera from "./lib/Camera";
import GLFTLoader from "./GLFTLoader";

import ImagePreloader from "./ImagePreloader";
import {Vector2, Vector3} from "math.gl";
import MouseListener from "./lib/MouseListener";
import Object3D from "./lib/core/Object3D";
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
import {LaptopScreen} from "./extras/LaptopScreen";
import Mill from "./extras/Mill";
import CombinePass from "./renderPasses/CombinePass";
import RenderSettings from "./RenderSettings";
import BlurBloom from "./renderPasses/BlurBloom";
import {FpsScreen} from "./extras/FpsScreen";
import Texture from "./lib/textures/Texture";
import {TextureFormat} from "./lib/WebGPUConstants";
import Model from "./lib/model/Model";
import Material from "./lib/core/Material";
import Sphere from "./lib/meshes/Sphere";
import CubeTestShader from "./shaders/CubeTestShader";
import ShadowCubePass from "./renderPasses/ShadowCubePass";
import ShadowCube from "./renderPasses/ShadowCube";
import MainLight from "./MainLight";
import Box from "./lib/meshes/Box";


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

    private lightJson: JSONLoader;
    private aoPass: AORenderPass;
    private aoBlurPass: AOBlurRenderPass;
    private reflectionPass: ReflectionRenderPass;
    private glassPass: GlassRenderPass;
    private blurLightPass: BlurLight;
    private laptopScreen: LaptopScreen;
    private mill: Mill;
    private combinePass: CombinePass;
    private numberOfQueries: number=10;
    private blurBloomPass: BlurBloom;
    private fpsScreen: FpsScreen;

    private shadowPass: ShadowCube;
    private mainLight: MainLight;
private lightPos = new Vector3(0,0,-3)
    private testSphere: Model;

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
        new TextureLoader(this.renderer,this.preloader,"brdf_lut.png",{});
        new TextureLoader(this.renderer,this.preloader,"triangle.png",{});
        new TextureLoader(this.renderer,this.preloader,"text_s.png",{});
        new TextureLoader(this.renderer,this.preloader,"7dig.png",{});
        ImagePreloader.load(this.renderer, this.preloader);

        this.glFTLoader = new GLFTLoader(this.renderer, "roomFinal", this.preloader);
        this.lightJson = new JSONLoader("light", this.preloader);
        UI.setWebGPU(this.renderer)

    }



    private loadProgress() {

    }

    private init() {

        this.mainLight =new MainLight(this.renderer)
        this.mainLight.setPosition(0,1,-1.5);
        this.shadowPass = new ShadowCube(this.renderer,this.mainLight)
        this.gBufferPass = new GBufferRenderPass(this.renderer)
        this.aoPass = new AORenderPass(this.renderer)
        this.aoBlurPass = new AOBlurRenderPass(this.renderer);
        this.lightPass = new LightRenderPass(this.renderer, this.lightJson.data,this.mainLight);
        this.blurLightPass =new BlurLight(this.renderer);
        this.reflectionPass = new ReflectionRenderPass(this.renderer);
        this.glassPass =new GlassRenderPass(this.renderer)
        this.combinePass=new CombinePass(this.renderer)
        this.blurBloomPass = new BlurBloom(this.renderer)


        this.canvasRenderPass = new CanvasRenderPass(this.renderer);

        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment)


        this.glFTLoader.root.setPosition(0, -1.5, 0)
        this.leftHolder = this.glFTLoader.objectsByName["left"]
        this.rightHolder = this.glFTLoader.objectsByName["right"]
        this.mill =new Mill(this.glFTLoader.objectsByName["mill"])

        for (let m of this.glFTLoader.models) {
            this.gBufferPass.modelRenderer.addModel(m)

        }
        this.testSphere=new Model(this.renderer,"testSphere")
        this.testSphere.mesh = new Box(this.renderer);
        this.testSphere.material =new Material(this.renderer,"testspeher",new CubeTestShader(this.renderer,"cubetest"));
        this.testSphere.material.uniforms.setTexture("colorTexture",this.renderer.texturesByLabel["ShadowCubeColor"])



        this.gBufferPass.modelRenderer.addModel( this.testSphere)
        this.shadowPass.setModels(this.gBufferPass.modelRenderer.models);

        this.laptopScreen =new LaptopScreen(this.renderer, this.glFTLoader.objectsByName["labtop"]);
        this.gBufferPass.modelRenderer.addModel(this.laptopScreen);
        this.fpsScreen =new FpsScreen(this.renderer, this.glFTLoader.objectsByName["powersup"]);
        this.gBufferPass.modelRenderer.addModel(  this.fpsScreen);

        for (let m of this.glFTLoader.modelsGlass) {

            m.material.uniforms.setTexture("gDepth",this.renderer.texturesByLabel["GDepth"])
            m.material.uniforms.setTexture("reflectTexture",this.renderer.texturesByLabel["BlurLightPass"])
            this.glassPass.modelRenderer.addModel(m)

        }
        this.tick()
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
        this.updateCamera();
        this.mill.update();


        UI.LVector("lightpos",this.lightPos)

        this.testSphere.setEuler(UI.LFloat("rx",0),UI.LFloat("ry",0),0);
        this.mainLight.setPosition(this.lightPos.x,this.lightPos.y,this.lightPos.z);
        this.testSphere.setPosition(this.lightPos.x,this.lightPos.y,this.lightPos.z);
        this.shadowPass.setLightPos(this.lightPos);
        this.lightPass.setLightPos(this.lightPos);


        UI.pushWindow("Render Setting")
        this.canvasRenderPass.onUI();
        RenderSettings.onUI();

        this.aoPass.onUI();
        this.reflectionPass.onUI();

        UI.popWindow()


        this.lightPass.onUI();


        UI.pushWindow("Debug/Performance")


        this.timeStampQuery.onUI();
        UI.popWindow()
    }
    updateCamera(){
        let mp = this.mouseListener.mousePos.clone()
        mp.scale(new Vector2(1 / (this.renderer.width/this.renderer.pixelRatio), 1 / (this.renderer.height/this.renderer.pixelRatio)))

        mp.x -= 0.5
        mp.x*=2.0;

        mp.y -= 0.5
        mp.y *= 1.0
        this.mouseTarget.lerp(mp, 0.1);
        let cameraPositionMap = new Vector3(-this.mouseTarget.x * 2.0, 1.0 + this.mouseTarget.y, 10);
        this.camera.cameraWorld = cameraPositionMap.clone();
        this.camera.cameraLookAt = new Vector3(cameraPositionMap.x, cameraPositionMap.y, 0);
        let screenLocal = new Vector2(this.renderer.ratio * 3, 3)

        this.camera.fovy = Math.atan2(screenLocal.y / 2, cameraPositionMap.z) * 2;
        this.camera.ratio =this.renderer.ratio;

        this.camera.lensShift.x = -cameraPositionMap.x / (screenLocal.x / 2);
        this.camera.lensShift.y = -cameraPositionMap.y / (screenLocal.y / 2);
    }

}

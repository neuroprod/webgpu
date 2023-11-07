

import CanvasManager from "./lib/CanvasManager";
import Renderer from "./lib/Renderer";

import Material from "./lib/core/Material";

import PreLoader from "./lib/PreLoader";

import Camera from "./lib/Camera";
import GLFTLoader from "./lib/loaders/GLFTLoader";
import TextureLoader from "./lib/loaders/TextureLoader";




export default class Main {
    private canvasManager: CanvasManager;
    private renderer: Renderer;



    private preloader: PreLoader;
    private camera: Camera;
    private glFTLoader: GLFTLoader;
    private testTexture: TextureLoader;
    constructor(canvas: HTMLCanvasElement) {

        this.canvasManager = new CanvasManager(canvas);
       this.renderer =new Renderer()
        this.renderer.setup(canvas).then(() => {
           this.setup()
        })
    }

public setup()
{
    this.preloader = new PreLoader(
        this.loadProgress.bind(this),
        this.init.bind(this)
    );
    this.renderer.init()
    this.camera =new Camera(this.renderer,"mainCamera")
    this.renderer.camera =   this.camera;
    this.testTexture = new TextureLoader(this.renderer,this.preloader,"textures/desk_Color.png",{})
    this.glFTLoader =new GLFTLoader(this.renderer,"roomFinal",this.preloader);

this.glFTLoader.material.uniforms.setTexture("testTexture",this.testTexture)


}
private loadProgress()
{

}
private init()
{


   for(let m of this.glFTLoader.models){
       this.renderer.mainRenderPass.addModel(m)
   }

    this.tick()
}
private update()
{

   /* this.camera.cameraWorld.x = Math.sin(Date.now()/1000)*5
    this.camera.cameraWorld.z = Math.cos(Date.now()/1000)*5
    this.camera.cameraWorld.y =1.5
    this.camera.cameraLookAt.y=1.5*/
}

private tick() {

    window.requestAnimationFrame(() => this.tick());



    this.update();
    this.renderer.draw();
}


}

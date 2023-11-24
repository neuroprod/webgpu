import Renderer from "../lib/Renderer";
import ShadowCubePass from "./ShadowCubePass";
import RenderTexture from "../lib/textures/RenderTexture";
import {TextureFormat} from "../lib/WebGPUConstants";
import Camera from "../lib/Camera";
import {Vector3} from "math.gl";
import MainLight from "../MainLight";
import Model from "../lib/model/Model";


export default class ShadowCube{
   public depthTarget: RenderTexture;
    private passes:Array<ShadowCubePass> =[]
    private cameras:Array<Camera>=[];
    private light: MainLight;
    private colorTarget: RenderTexture;
    private  offsets =[new Vector3(-1,0,0),new Vector3(1,0,0),new Vector3(0,-1,0),new Vector3(0,1,0),new Vector3(0,0,-1),new Vector3(0,0,1)]

    constructor(renderer:Renderer,light:MainLight) {

        this.light =light;
        this.depthTarget = new RenderTexture(renderer, "ShadowCube", {
            format: TextureFormat.Depth24Plus,
            sampleCount: 1,
            scaleToCanvas: false,
            width:1024,
            height:1024,
            depthOrArrayLayers:6,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthTarget.make()



        this.colorTarget = new RenderTexture(renderer, "ShadowCubeColor", {
            format: TextureFormat.R16Float,
            sampleCount: 1,
            scaleToCanvas: false,
            width:1024,
            height:1024,
            depthOrArrayLayers:6,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorTarget.make()


        let wp = this.light.getWorldPos();


        const  ups =[new Vector3(0,-1,0),new Vector3(0,-1,0),new Vector3(0,0,1),new Vector3(0,0,-1),new Vector3(0,-1,0),new Vector3(0,-1,0)]

        for (let i=0;i<6;i++){
           let camera = new Camera(renderer, "cubeCamera")

            camera.fovy = Math.PI / 2
            camera.near =0.01;
            camera.far = 10;

            camera.cameraWorld =wp;
            camera.cameraLookAt =wp.clone().add(this.offsets[i]);
            camera.cameraUp =ups[i];


            this.cameras.push(camera);

            let pass =new ShadowCubePass(renderer,this.depthTarget,i,camera,this.colorTarget);
            this.passes.push(pass);
        }




    }
    setModels(models:Array<Model>){
        for (let i=0;i<6;i++){
            this.passes[i].models=models;
        }
    }
    public add(){
       for (let p of this.passes){
       p.add();
       }
    }


    setLightPos(lightPos: Vector3) {

        let count =0;
        for (let camera of this.cameras){

            camera.cameraWorld =lightPos.clone();
            camera.cameraLookAt =lightPos.clone().add(this.offsets[count]);

            count++;
        }
    }
}

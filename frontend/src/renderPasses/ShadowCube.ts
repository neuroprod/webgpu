import Renderer from "../lib/Renderer";
import ShadowCubePass from "./ShadowCubePass";
import RenderTexture from "../lib/textures/RenderTexture";
import {TextureFormat} from "../lib/WebGPUConstants";
import Camera from "../lib/Camera";
import {Vector3} from "math.gl";
import MainLight from "../MainLight";
import Model from "../lib/model/Model";
import UI from "../lib/UI/UI";

export default class ShadowCube{
   public depthTarget: RenderTexture;
    private passes:Array<ShadowCubePass> =[]
    private cameras:Array<Camera>=[];
    private light: MainLight;
    private colorTarget: RenderTexture;

    constructor(renderer:Renderer,light:MainLight) {

        this.light =light;
        this.depthTarget = new RenderTexture(renderer, "ShadowCube", {
            format: TextureFormat.Depth24Plus,
            sampleCount: 1,
            scaleToCanvas: false,
            width:256,
            height:256,
            depthOrArrayLayers:6,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthTarget.make()



        this.colorTarget = new RenderTexture(renderer, "ShadowCubeColor", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: 1,
            scaleToCanvas: false,
            width:256,
            height:256,
            depthOrArrayLayers:6,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorTarget.make()

       // '../assets/img/cubemap/posx.jpg',
       //     '../assets/img/cubemap/negx.jpg',
        //    '../assets/img/cubemap/posy.jpg',
        //    '../assets/img/cubemap/negy.jpg',
         //   '../assets/img/cubemap/posz.jpg',
         //   '../assets/img/cubemap/negz.jpg',
        let wp = this.light.getWorldPos();

        let offsets =[new Vector3(1,0,0),new Vector3(-1,0,0),new Vector3(0,1,0),new Vector3(0,-1,0),new Vector3(0,0,1),new Vector3(0,0,-1)]
        let ups =[new Vector3(0,1,0),new Vector3(0,1,0),new Vector3(0,0,-1),new Vector3(0,0,1),new Vector3(0,1,0),new Vector3(0,1,0)]

        for (let i=0;i<6;i++){
           let camera = new Camera(renderer, "cubeCamera")

            camera.fovy =2;// Math.PI / 2
            camera.near =0.01;
            camera.far = 10;
            console.log(wp,wp.clone().add(offsets[i]))
            camera.cameraWorld =wp;
            camera.cameraLookAt =wp.clone().add(offsets[i]);
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


        //right,left,bla,bla
        let offsets =[new Vector3(-1,0,0),new Vector3(1,0,0),new Vector3(0,1,0),new Vector3(0,-1,0),new Vector3(0,0,1),new Vector3(0,0,-1)]
       let  s= UI.LFloat("fov",Math.PI/2);
        // let ups =[new Vector3(0,1,0),new Vector3(0,1,0),new Vector3(0,0,-1),new Vector3(1,0,-1),new Vector3(0,1,0),new Vector3(0,1,0)]
        let count =0;
        for (let camera of this.cameras){
            camera.fovy =s;
            camera.cameraWorld =lightPos.clone();
            camera.cameraLookAt =lightPos.clone().add(offsets[count]);
            console.log( camera.cameraWorld, camera.cameraLookAt)
            count++
        }
    }
}

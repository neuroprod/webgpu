import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import Camera from "./lib/Camera";
import GameModel from "./GameModel";
import UIBitmapModel from "./lib/model/UIBitmapModel";
import Model from "./lib/model/Model";
import UIModelRenderer from "./UIModelRenderer";
import {Vector2, Vector3, Vector4} from "math.gl";
import UIModel from "./lib/model/UIModel";
import {render} from "react-dom";



export default class GameUI
{




    private camera: Camera;
   
    modelRenderer: UIModelRenderer;
    private renderer: Renderer;
    private test: UIBitmapModel;
    private root:UIModel;
    private test2: UIBitmapModel;

    private downItem:UIModel =null;
    private overItem:UIModel =null;

    constructor(renderer:Renderer,preLoader:PreLoader) {

        this.renderer  =renderer;
        this.camera = new Camera(renderer,"uiCamera");
        this.camera.perspective =false;


        this.root =new UIModel(renderer,"uiRoot") ;

        this.modelRenderer =new UIModelRenderer(renderer,"UIModelRenderer")
        this.modelRenderer.camera = this.camera;
        this.test =new UIBitmapModel(renderer,preLoader,"test1","UI/BlueNoise.png")
        this.root.addChild(this.test);
        this.test.setPosition(500,500,0)


        this.test2 =new UIBitmapModel(renderer,preLoader,"test2","UI/BlueNoise.png")
        this.root.addChild(this.test2);
        this.test2.setPosition(600,100,0)
       // this.test.setEuler(Math.PI,0,0)

        this.modelRenderer.models=[];
    }
    preload(preloader: PreLoader) {

    }
    public init(){


    }
    public update(){
        this.updateCamera()

    }


    private updateCamera() {
        this.camera.orthoBottom=GameModel.screenHeight
        this.camera.orthoLeft =0;
        this.camera.orthoRight =GameModel.screenWidth
        this.camera.orthoTop =0;
        this.camera.near =-5;
        this.camera.far =5;
        this.camera.cameraWorld.set(0,0,1)
        this.camera.cameraLookAt.set(0,0,-1)

        this.modelRenderer.models=[];
        this.root.collectChildren(this.modelRenderer.models);
    }

    updateMouse(mousePos: Vector2, mouseDownThisFrame: boolean, mouseUpThisFrame: boolean) {
       let r =  this.root.checkMouse(mousePos)
        if(r){
            if(mouseDownThisFrame)
            {
                this.downItem =r;
                this.downItem.onDown()
            }

            if(this.downItem ==r && mouseUpThisFrame ){
                this.downItem.onClick();

            }
            if(r != this.overItem){
                if(this.overItem)this.overItem.onOut()
                this.overItem =r;
                this.overItem.onOver()
            }

        }else{
            if(this.overItem)this.overItem.onOut()
            this.overItem =null;

        }
        if(mouseUpThisFrame){
            if(this.downItem)this.downItem.onUp()
            this.downItem =null;
        }
    }
}

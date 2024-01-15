import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import Camera from "../lib/Camera";
import GameModel, {UIState} from "../GameModel";
import UIBitmapModel from "../lib/model/UIBitmapModel";
import UIModelRenderer from "./UIModelRenderer";
import {Vector2} from "math.gl";
import UIModel from "../lib/model/UIModel";
import MenuButton from "./MenuButton";
import Inventory from "./Inventory";
import Menu from "./Menu";
import InventoryDetail from "./InventoryDetail";


export default class GameUI
{




    private camera: Camera;

    modelRenderer: UIModelRenderer;
    private renderer: Renderer;

    private root:UIModel;


    private downItem:UIModel =null;
    private overItem:UIModel =null;
    private menuButton: MenuButton;
    private inventory: Inventory;
    private menu: Menu;
    private inventoryDetail: InventoryDetail;

    constructor(renderer:Renderer,preLoader:PreLoader) {

        this.renderer  =renderer;
        this.camera = new Camera(renderer,"uiCamera");
        this.camera.perspective =false;


        this.root =new UIModel(renderer,"uiRoot") ;

        this.modelRenderer =new UIModelRenderer(renderer,"UIModelRenderer")
        this.modelRenderer.camera = this.camera;


        this.inventoryDetail =new InventoryDetail(renderer,preLoader);
        this.root.addChild( this.inventoryDetail);
        this.menuButton =new MenuButton(renderer,preLoader);
        this.root.addChild(this.menuButton);

        this.inventory =new Inventory(renderer,preLoader)
        this.root.addChild(this.inventory);

        this.menu =new Menu(renderer,preLoader)
        this.root.addChild(this.menu);

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
        this.modelRenderer.models.reverse()
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

    setUIState(state: UIState) {
        if(state==UIState.OPEN_MENU){
            this.menuButton.hide()
            this.inventory.hide()
            this.menu.show()
        }
        if(state==UIState.GAME_DEFAULT){
            this.menuButton.show()
            this.inventory.show()
            this.menu.hide()
            this.inventoryDetail.hide()
        }
        if(state==UIState.INVENTORY_DETAIL){

            this.inventoryDetail.show()

        }
    }
}

import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import Scene from "./Scene";
import GameModel, {Scenes} from "./GameModel";
import Model from "./lib/model/Model";
import MouseListener from "./lib/MouseListener";

export default class GameUI extends Scene
{
    private mainPanel: Model;
    private settingsButton: Model;
    private loaded: boolean =false;
    constructor(renderer:Renderer,preLoader:PreLoader) {

        super(renderer,preLoader,"UI")

    }
    public init(){
        this.loaded =true;
        this.glFTLoader.root.setEuler(0,0,0)
        this.mainPanel =this.glFTLoader.modelsByName["mainPanel"];
        this.mainPanel.visible =false;

        this.settingsButton =this.glFTLoader.modelsByName["settingsButton"];

    }
    public update(){
        if(!this.loaded)return;
        let scale=1;
        if(GameModel.currentScene==Scenes.OUTSIDE){
            scale=4/3
        }
        let w =(this.renderer.ratio * GameModel.sceneHeight)/scale;
        let h=GameModel.sceneHeight/scale;
        this.glFTLoader.root.setPosition(GameModel.gameCamera.offsetX,0,0)
        this.glFTLoader.root.setScale(scale,scale,scale)

       this.settingsButton.setPosition(-w/2+0.3, h/2-0.3,0);

    }

    updateMouse(mouseListener: MouseListener) {
        if(GameModel.hitObjectLabel=="settingsButton" && mouseListener.isDownThisFrame){
            console.log("click")

            this.mainPanel.visible =!this.mainPanel.visible

        }
    }
}

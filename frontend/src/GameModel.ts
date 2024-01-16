import Transition from "./transitions/Transition";
import GoOutside from "./transitions/GoOutside";
import StartGame from "./transitions/StartGame";
import {Vector2, Vector3} from "math.gl";
import Main from "./Main";
import GoInside from "./transitions/GoInside";
import Trigger from "./trigers/Trigger";
import HitTextTrigger from "./trigers/HitTextTrigger";
import Drawing from "./drawing/Drawing";
import GoRightRoom from "./transitions/GoRightRoom";
import GoLeftRoom from "./transitions/GoLeftRoom";
import {FloorHitTrigger} from "./trigers/FloorHitTrigger";
import {FloorHitIndicator} from "./extras/FloorHitIndicator";
import OutlinePass from "./renderPasses/OutlinePass";
import Renderer from "./lib/Renderer";
import CharacterHandler from "./CharacterHandler";
import DoorGoOutsideTrigger from "./trigers/DoorGoOutsideTrigger";
import DoorGoInsideTrigger from "./trigers/DoorGoInsideTrigger";
import DoorInsideTrigger from "./trigers/DoorInsideTrigger";
import GoWorkTrigger from "./trigers/GoWorkTrigger";
import GameCamera from "./GameCamera";
import TextHandler from "./TextHandler";
import UI from "./lib/UI/UI";
import SoundHandler from "./SoundHandler";
import GameUI from "./ui/GameUI";
import RenderSettings from "./RenderSettings";


export const Transitions =
    {
        GO_OUTSIDE: new GoOutside(),
        START_GAME: new StartGame(),
        GO_INSIDE: new GoInside(),
        GO_RIGHT_ROOM: new GoRightRoom(),
        GO_LEFT_ROOM: new GoLeftRoom(),


    }
export enum UIState
{
        GAME_DEFAULT,
       OPEN_MENU,
        INVENTORY_DETAIL,


}
export enum GameState {
    START,
    READ_MAIL,
    READ_MAIL_DONE,
}

export enum Scenes {
    OUTSIDE,
    ROOM,
    PRELOAD,
}

class GameModel {
    public renderer: Renderer;
    public roomCamOffset: number = -1;
    public isLeftRoom = true;

    public currentScene: Scenes = Scenes.PRELOAD
    public floorHitIndicator: FloorHitIndicator;
    public yMouseCenter: number = 1;
    public yMouseScale: number = 1;
    public sceneHeight = 3;
    public main: Main;
    mouseUpThisFrame:boolean =false ;
     mouseDownThisFrame: boolean = false;
     mousePos: Vector2 = new Vector2();

    public characterPos: Vector3 = new Vector3(0, 0, 0);
    dayNight: number = 0;
    lockView: boolean = false;

    public drawingByLabel: { [label: string]: Drawing } = {};
    public hitStateChange: boolean = false;
    public hitObjectLabelPrev: string = "";
    hitWorldPos: Vector3;
    hitWorldNormal: Vector3;
    outlinePass: OutlinePass;
    private triggers: Array<Trigger> = []
    private groundArray = ["_HitRightRoom", "_HitLeftRoomCenter", "_HitLeftRoomRight", "_HitLeftRoomLeft", "_HitGround"]
    characterHandler: CharacterHandler;
    gameCamera: GameCamera;
    frustumCull =true;
    textHandler: TextHandler;


    public gameState=0
    catchMouseDown: boolean =false;
    sound: SoundHandler;
    gameUI: GameUI;
    screenWidth: number;
   screenHeight: number;

    debug: boolean=true;
    constructor() {

        this.makeTriggers();
    }

    private _hitObjectLabel: string = "";

    get hitObjectLabel(): string {
        return this._hitObjectLabel;
    }

    set hitObjectLabel(value: string) {

        if (value == this._hitObjectLabel) {
            return;
        }


        this.hitStateChange = true;
        this.hitObjectLabelPrev = this._hitObjectLabel;
        this._hitObjectLabel = value;
        if(this.debug)UI.logEvent("Hit", value);
        if (this._hitObjectLabel == "" || this.isGround(this._hitObjectLabel)) {
            this.outlinePass.setModel(null);
        } else {
            let model = this.renderer.modelByLabel[this._hitObjectLabel];
            this.outlinePass.setModel(model);

        }
    }

    update() {
       this.screenWidth = this.renderer.width/this.renderer.pixelRatio;
        this.screenHeight = this.renderer.height/this.renderer.pixelRatio;
        //checkUI
        this.gameUI.updateMouse(this.mousePos,this.mouseDownThisFrame,this.mouseUpThisFrame)
        this.gameUI.update()



        if(this.mouseDownThisFrame && this.catchMouseDown){
            this.onMouseDown();
        }

        for (let t of this.triggers) {
            t.check();
        }
        if(this.textHandler)this.textHandler.update();
        this.hitStateChange = false;
    }

    public setScene(scenes: Scenes) {
        this.main.setScene(scenes);
        this.currentScene = scenes;
    }

    setTransition(t: Transition) {
        t.set(this.transitionComplete.bind(this));
    }

    transitionComplete() {
        // console.log("complete")
    }

    public isGround(label: string) {
        if (this.groundArray.includes(label)) return true;
        return false;
    }

    getDrawingByLabel(label: string) {
        return this.drawingByLabel[label];
    }

    private makeTriggers() {
     /*   this.triggers.push(new HitInfoTrigger(Scenes.ROOM, "door_HO", "goOutside_door_HO"))
        this.triggers.push(new HitInfoTrigger(Scenes.ROOM, "teapot", "tea_teapot"))
        this.triggers.push(new HitInfoTrigger(Scenes.ROOM, "coffee", "coffe_coffee"))
        this.triggers.push(new HitInfoTrigger(Scenes.ROOM, "pan", "pan_pan"))
        this.triggers.push(new HitInfoTrigger(Scenes.ROOM, "hamer", "CR_hamer"))
        this.triggers.push(new HitInfoTrigger(Scenes.ROOM, "paperWallLeft", "CR_paperWallLeft"))
*/
        this.triggers.push(new DoorGoOutsideTrigger(Scenes.ROOM, "door_HO"));
        this.triggers.push(new DoorGoInsideTrigger(Scenes.OUTSIDE, "door"));
        this.triggers.push(new DoorInsideTrigger(Scenes.ROOM, "_HitCenterDoor"));
        this.triggers.push(new GoWorkTrigger(Scenes.ROOM, "labtop"));
        this.triggers.push(new FloorHitTrigger(Scenes.ROOM, ["_HitRightRoom", "_HitLeftRoomCenter", "_HitLeftRoomRight", "_HitLeftRoomLeft"]))
        this.triggers.push(new FloorHitTrigger(Scenes.OUTSIDE, ["_HitGround"]))
    }

    initText() {
        this.textHandler.init()
        for(let d of this.textHandler.hitTriggers){
            d.object
            this.triggers.push(new HitTextTrigger(d.scene,  d.object))
        }
    }

    setGameState(state:GameState){
        this.gameState =state;
        if(this.gameState==GameState.READ_MAIL){
            this.catchMouseDown =true;
            this.hitObjectLabel =""
        }
        if(this.gameState==GameState.READ_MAIL_DONE){
            this.catchMouseDown =false;
        }
    }

    private onMouseDown() {

        if(this.gameState==GameState.READ_MAIL){
            if(this.textHandler.readNext()){
                this.setGameState(GameState.READ_MAIL_DONE)
            }
        }
    }

    setUIState(state:UIState) {
        this.gameUI.setUIState(state);
        if(state==UIState.OPEN_MENU){
            RenderSettings.openMenu()
        }else if(state==UIState.GAME_DEFAULT){
            RenderSettings.closeMenu()
        }
    }
}

export default new GameModel()


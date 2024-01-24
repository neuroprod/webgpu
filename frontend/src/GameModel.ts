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
import GoGraveTrigger from "./trigers/GoGraveTrigger";
import GoHunterTrigger from "./trigers/GoHunterPants";
import SitTrigger from "./trigers/SitTrigger";
import ReadMail from "./transitions/ReadMail";
import FindHunterPants from "./transitions/FindHunterPants";
import TextInfo from "./transitions/TextInfo";


export const Transitions =
    {
        GO_OUTSIDE: new GoOutside(),
        START_GAME: new StartGame(),
        GO_INSIDE: new GoInside(),
        GO_RIGHT_ROOM: new GoRightRoom(),
        GO_LEFT_ROOM: new GoLeftRoom(),
        READ_MAIL: new ReadMail(),
        FIND_HUNTER_PANTS: new FindHunterPants(),
        TEXT_INFO: new TextInfo(),
    }

export enum UIState {
    GAME_DEFAULT,
    OPEN_MENU,
    INVENTORY_DETAIL,
    PRELOAD_DONE,
    PRELOAD,
    HIDE_MENU,


}

export enum GameState {
    START,
    READ_MAIL,
    READ_MAIL_DONE,
    READ_CROSS,
    FIND_HUNTER,
}

export enum Scenes {
    OUTSIDE,
    ROOM,
    PRELOAD,
}

class GameModel {
    public renderer: Renderer;
    public roomCamOffset: number = 0;
    public isLeftRoom = false;

    public currentScene: Scenes = Scenes.PRELOAD
   // public floorHitIndicator: FloorHitIndicator;
    public yMouseCenter: number = 1;
    public yMouseScale: number = 1;
    public sceneHeight = 2.5;
    public main: Main;
    mouseUpThisFrame: boolean = false;
    mouseDownThisFrame: boolean = false;
    mousePos: Vector2 = new Vector2();
    mouseMove: boolean = false;
    public characterPos: Vector3 = new Vector3(0, 0, 0);
    dayNight: number = 0;
    lockView: boolean = false;

    public drawingByLabel: { [label: string]: Drawing } = {};
    public hitStateChange: boolean = false;
    public hitObjectLabelPrev: string = "";
    hitWorldPos: Vector3;
    hitWorldNormal: Vector3;
    outlinePass: OutlinePass;
    characterHandler: CharacterHandler;
    gameCamera: GameCamera;
    frustumCull = true;
    textHandler: TextHandler;
    public gameState = 0
    catchMouseDown: boolean = false;
    sound: SoundHandler;
    gameUI: GameUI;
    screenWidth: number;
    screenHeight: number;
    public pantsFound: number = 0;
    public currentPants: number = 0;
    uiOpen = false;
    //debugstuff
    devSpeed: boolean = false;
    debug: boolean = false;
    startOutside: boolean = false;
    private triggers: Array<Trigger> = []
    private groundArray = ["_HitRightRoom", "_HitLeftRoomCenter", "_HitLeftRoomRight", "_HitLeftRoomLeft", "_HitGround"]
    private storedState: number;
    private currentTransition: Transition;

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
        if (this.debug) UI.logEvent("Hit", value);
        /*if (this._hitObjectLabel == "" || this.isGround(this._hitObjectLabel)) {
           // this.outlinePass.setModel(null);
        } else {
            let model = this.renderer.modelByLabel[this._hitObjectLabel];
          //  this.outlinePass.setModel(model);

        }*/
    }

    update() {

        this.screenWidth = this.renderer.width / this.renderer.pixelRatio;
        this.screenHeight = this.renderer.height / this.renderer.pixelRatio;

        if (this.currentTransition) {
            if (this.mouseDownThisFrame) this.currentTransition.onMouseDown()

        }
        this.gameUI.updateMouse(this.mousePos, this.mouseDownThisFrame, this.mouseUpThisFrame)
        this.gameUI.update()
        if (!this.currentTransition) {
            //checkUI

            for (let t of this.triggers) {
                t.check();
            }
        }
        if (this.textHandler) this.textHandler.update();
        this.hitStateChange = false;
    }

    public setScene(scenes: Scenes) {
        this.main.setScene(scenes);
        this.currentScene = scenes;
    }

    setTransition(t: Transition, data: string = "") {
        this.hitObjectLabel = ""
        this.catchMouseDown = true;
        this.currentTransition = t;
        this.outlinePass.setModel( null);

        this.gameUI.cursor.hide()
        this.setUIState(UIState.HIDE_MENU)
        t.set(this.transitionComplete.bind(this), data);
    }

    transitionComplete() {
        this.mouseDownThisFrame = false
        this.catchMouseDown = false;
        this.currentTransition = null;
        this.setUIState(UIState.GAME_DEFAULT)
    }

    public isGround(label: string) {
        if (this.groundArray.includes(label)) return true;
        return false;
    }

    getDrawingByLabel(label: string) {
        return this.drawingByLabel[label];
    }

    initText() {
        this.textHandler.init()
        for (let d of this.textHandler.hitTriggers) {

            this.triggers.push(new HitTextTrigger(d.scene, d.object))
        }
    }

    setGameState(state: GameState) {

        if (state == GameState.READ_MAIL) {
            this.catchMouseDown = true;
            this.hitObjectLabel = ""
        }
        if (state == GameState.READ_CROSS) {
            this.catchMouseDown = true;
            this.hitObjectLabel = ""
            this.storedState = this.gameState;
        }
        if (state == GameState.FIND_HUNTER) {
            this.catchMouseDown = true;
            this.hitObjectLabel = ""
            this.gameState = this.storedState;
        }

        this.gameState = state;
    }

    setUIState(state: UIState, data: any = null) {
        this.gameUI.setUIState(state, data);

        if (state == UIState.OPEN_MENU || state == UIState.INVENTORY_DETAIL) {
            RenderSettings.openMenu()
            this.uiOpen = true;

        } else if (state == UIState.GAME_DEFAULT) {
            RenderSettings.closeMenu()
            this.uiOpen = false;
        }
    }

    usePants(id: number) {
        this.currentPants = id;
        this.characterHandler.setPants(id)
    }

    private makeTriggers() {
        this.triggers.push(new GoHunterTrigger(Scenes.OUTSIDE, "hunterPants"));
        this.triggers.push(new GoGraveTrigger(Scenes.OUTSIDE, "cross"));
        this.triggers.push(new DoorGoOutsideTrigger(Scenes.ROOM, "door_HO"));
        this.triggers.push(new DoorGoInsideTrigger(Scenes.OUTSIDE, "door"));
        this.triggers.push(new DoorInsideTrigger(Scenes.ROOM, "_HitCenterDoor"));
        this.triggers.push(new SitTrigger(Scenes.ROOM, "chair"));
        this.triggers.push(new GoWorkTrigger(Scenes.ROOM, "labtop"));
        this.triggers.push(new FloorHitTrigger(Scenes.ROOM, ["_HitRightRoom", "_HitLeftRoomCenter", "_HitLeftRoomRight", "_HitLeftRoomLeft"]))
        this.triggers.push(new FloorHitTrigger(Scenes.OUTSIDE, ["_HitGround"]))
    }

    private onMouseDown() {

        /*
                if(this.gameState==GameState.READ_MAIL){
                    if(this.textHandler.readNext()){
                        this.catchMouseDown =false;
                        this.setGameState(GameState.READ_MAIL_DONE)
                        this.characterHandler.setAnimation("idle")
                    }
                }
                if(this.gameState==GameState.READ_CROSS){
                    if(this.textHandler.readNext()){
                        this.gameState =this.storedState;
                        this.catchMouseDown =false;
                    }
                }
                if(this.gameState==GameState.FIND_HUNTER){
                    if(this.textHandler.readNext()){
                        this.gameState =this.storedState;
                        this.catchMouseDown =false;
                        this.renderer.modelByLabel["hunterPants"].visible =false;
                        this.renderer.modelByLabel["hunterPants"].enableHitTest =false;
                        this.pantsFound =1;
                        this.gameUI.updateInventory();
                        this.sound.playPop();
                        this.setUIState(UIState.INVENTORY_DETAIL,1)
                    }
                }*/
    }


}

export default new GameModel()


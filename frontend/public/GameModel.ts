import Transition from "../src/transitions/Transition";
import GoOutside from "../src/transitions/GoOutside";
import StartGame from "../src/transitions/StartGame";
import {Vector2, Vector3} from "math.gl";
import Main from "../src/Main";
import GoInside from "../src/transitions/GoInside";
import Trigger from "../src/trigers/Trigger";
import HitTextTrigger from "../src/trigers/HitTextTrigger";
import Drawing from "../src/drawing/Drawing";
import GoRightRoom from "../src/transitions/GoRightRoom";
import GoLeftRoom from "../src/transitions/GoLeftRoom";
import {FloorHitTrigger} from "../src/trigers/FloorHitTrigger";
import OutlinePass from "../src/renderPasses/OutlinePass";
import Renderer from "../src/lib/Renderer";
import CharacterHandler from "../src/CharacterHandler";
import DoorGoOutsideTrigger from "../src/trigers/DoorGoOutsideTrigger";
import DoorGoInsideTrigger from "../src/trigers/DoorGoInsideTrigger";
import DoorInsideTrigger from "../src/trigers/DoorInsideTrigger";
import GoWorkTrigger from "../src/trigers/GoWorkTrigger";
import GameCamera from "../src/GameCamera";
import TextHandler from "../src/TextHandler";
import UI from "../src/lib/UI/UI";
import SoundHandler from "../src/SoundHandler";
import GameUI from "../src/ui/GameUI";
import RenderSettings from "../src/RenderSettings";
import GoGraveTrigger from "../src/trigers/GoGraveTrigger";
import GoHunterTrigger from "../src/trigers/GoHunterPants";
import SitTrigger from "../src/trigers/SitTrigger";
import ReadMail from "../src/transitions/ReadMail";
import FindHunterPants from "../src/transitions/FindHunterPants";
import TextInfo from "../src/transitions/TextInfo";
import BookCaseTrigger from "../src/trigers/BookCaseTrigger";
import MillTrigger from "../src/trigers/MillTrigger";
import Room from "../src/Room";
import Outside from "../src/Outside";
import UIUtils from "../src/lib/UI/UIUtils";
import SelectItem from "../src/lib/UI/math/SelectItem";
import StartMill from "../src/transitions/StartMill";
import Work from "../src/transitions/Work";
import GoGrave from "../src/transitions/GoGrave";
import FlowerPotHitTrigger from "../src/trigers/FlowerPotHitTrigger";
import FlowerHitTrigger from "../src/trigers/FlowerHitTrigger";
import PointLight from "../src/renderPasses/PointLight";
import MachineHitTrigger from "../src/trigers/MachineTrigger";
import PickFlower from "../src/transitions/PickFlower";
import StartMachine from "../src/transitions/StartMachine";
import FishFoodTrigger from "../src/trigers/FishFoodTrigger";
import BirdHouseTrigger from "../src/trigers/BirdHouseTrigger";
import FishTrigger from "../src/trigers/FishTrigger";
import GirlPantsTrigger from "../src/trigers/GirlPantsTrigger";
import GrandpaPantsTrigger from "../src/trigers/GrandpaPantsTrigger";
import ShovelTrigger from "../src/trigers/ShovelTrigger";
import StickTrigger from "../src/trigers/StickTrigger";
import TakeFishFood from "../src/transitions/TakeFishFood";
import FeedFish from "../src/transitions/FeedFish";
import FindGrandpaPants from "../src/transitions/FindGrandpaPants";
import TakeStick from "../src/transitions/TakeStick";
import PushBirdHouse from "../src/transitions/PushBirdHouse";
import FindGirlpaPants from "../src/transitions/FindGirlPants";
import PackageTrigger from "../src/trigers/PackageTrigger";
import MailBoxTrigger from "../src/trigers/MailBoxTrigger";
import FindFasionPants from "../src/transitions/FindFasionPants";
import HighTechPantsTrigger from "../src/trigers/HighTechPantsTrigger";
import FindGlowPants from "../src/transitions/FindGlowPants";
import KeyTrigger from "../src/trigers/KeyTrigger";
import TakeKey from "../src/transitions/TakeKey";
import OpenBookcase from "../src/transitions/OpenBookcase";
import TakeShovel from "../src/transitions/TakeShovel";
import DigGraveTrigger from "../src/trigers/DigGraveTrigger";
import DigGrave from "../src/transitions/DigGrave";
import LightOutsideRenderPass from "../src/renderPasses/LightOutsideRenderPass";
import GrandpaFishTrigger from "../src/trigers/GrandpaFishTrigger";
import AnimationMixer from "../src/lib/animation/AnimationMixer";
import WearPants from "../src/transitions/WearPants";
import Sit from "../src/transitions/Sit";
import Pants3D from "../src/extras/Pants3D";
import TextInfoLock from "../src/transitions/TextInfoLock";
import Clock from "../src/extras/Clock";
import ColorV from "../src/lib/ColorV";

export enum StateGold {
    START,
    LOCKED_DOOR,
    START_MILL,
    FINISH_KEY,
    HAS_KEY,
    FIND_NOTE,
    GET_SHOVEL,
    GET_GOLD,
    OUTRO,

}

export enum StateGrandpa {
    START,
    TAKE_FISH_FOOD,
    FEED_FISH,
    SHOW_GRANDPA_PANTS,
    TAKE_GRANDPA_PANTS,
}

export enum StateGirl {
    START,
    BIRD_HOUSE_FELL,
    FIND_STICK,
    PUSH_BIRDHOUSE,
    TAKE_GIRL_PANTS,

}

export enum StateFasion {
    START,
    READ_MAIL,
    READ_MAIL_DONE,
    CAN_MAKE_TRIANGLE,
    MAKE_TRIANGLE,
    FINISH_WEBSITE_DONE,
    CAN_READ_MAIL_MAILBOX,
    READ_MAIL_MAILBOX,
    GET_FASION_PANTS,
    TAKE_FASION_PANTS,
}

export enum StateHighTech {
    START,
    GROW_FLOWER,
    PICK_FLOWER,
    START_MACHINE,
    STOP_MACHINE,
    TAKE_HIGHTECH_PANTS,
}

export enum StateHunter {
    START,
    HAVE_PANTS,

}


export enum MillState {
    OFF,
    ON,
    DONE,

}

export const Pants =
    {
        default: 0,
        hunter: 1,
        girl: 2,
        grandpa: 3,
        glow: 4,
        fashion: 5,
        gold: 6,
    }


export const Transitions =
    {
        WEAR_PANTS: new WearPants(),
        GO_OUTSIDE: new GoOutside(),
        START_GAME: new StartGame(),
        GO_INSIDE: new GoInside(),
        GO_RIGHT_ROOM: new GoRightRoom(),
        GO_LEFT_ROOM: new GoLeftRoom(),
        READ_MAIL: new ReadMail(),
        FIND_HUNTER_PANTS: new FindHunterPants(),
        TEXT_INFO: new TextInfo(),
        START_MILL: new StartMill(),
        WORK: new Work(),
        GO_GRAVE: new GoGrave(),
        PICK_FLOWER: new PickFlower(),
        START_MACHINE: new StartMachine(),
        TAKE_FISH_FOOD: new TakeFishFood(),
        FEED_FISH: new FeedFish(),
        FIND_GRANDPA_PANTS: new FindGrandpaPants(),
        TAKE_STICK: new TakeStick(),
        PUSH_BIRDHOUSE: new PushBirdHouse(),
        FIND_GIRL_PANTS: new FindGirlpaPants(),
        TAKE_PACKAGE: new FindFasionPants(),
        FIND_GLOW_PANTS: new FindGlowPants(),
        TAKE_KEY: new TakeKey(),
        OPEN_BOOKCASE: new OpenBookcase(),
        TAKE_SHOVEL: new TakeShovel(),
        DIG_GRAVE: new DigGrave(),
        SIT: new Sit(),
        TEXT_INFO_LOCK: new TextInfoLock()


    }

export enum UIState {
    GAME_DEFAULT,
    OPEN_MENU,
    INVENTORY_DETAIL,
    PRELOAD_DONE,
    PRELOAD,
    HIDE_MENU,
    PRELOAD_DONE_WAIT,
    SHOW_NOTE,
    END_SCREEN,


}


export enum Scenes {
    OUTSIDE,
    ROOM,
    PRELOAD,
}

class GameModel {
    public compVisible = false
    public stateHunter = StateHunter.START
    public millState = MillState.OFF;
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
    public characterScreenPos: Vector3 = new Vector3(0, 0, 0);
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
    catchMouseDown: boolean = false;
    sound: SoundHandler;
    gameUI: GameUI;
    screenWidth: number;
    screenHeight: number;
    public pantsFound: Array<number> = [0];
    public currentPants: number = 0;
    uiOpen = false;
    //debugstuff
    devSpeed: boolean = false;
    debug: boolean = false;
    startOutside: boolean = false;
    room: Room;
    outside: Outside;
    lastClickLabels: Array<string> = [];
    pointLightsByLabel: { [name: string]: PointLight } = {};
    currentTransition: Transition;
    lightOutsidePass: LightOutsideRenderPass;
    introDraw: Drawing;
    minRoomSize = 4.5
    animationMixer: AnimationMixer;
    drawCount: number = 0;
    pants3D: Pants3D;
    emptyValueCount = 0;
    private goldSelect: Array<SelectItem>;
    private floorLabels: string[];
    private triggers: Array<Trigger> = []
    private millSelect: Array<SelectItem>;
    private highTechSelect: Array<SelectItem>;
    private girlSelect: Array<SelectItem>;
    private grandpaSelect: Array<SelectItem>;
    private fashionSelect: Array<SelectItem>;
    private prevTransition: Transition;
    private stopCount: number = 0;
    offsetY: number =0;
    clock: Clock;
    temp1 =new Vector3(0,0,0)
    temp2 =new Vector3()
    tempC: ColorV =new ColorV(1,0,0,1);

    constructor() {


        this.prepUI()
    }

    private _stateGold: StateGold = StateGold.START

    get stateGold(): StateGold {
        return this._stateGold;
    }

    set stateGold(value: StateGold) {
        if (value == StateGold.START) {
            this.renderer.modelByLabel["shovel"].visible = true
            this.renderer.modelByLabel["shovelHold"].visible = false;
        }
        if (value == StateGold.START_MILL) {

        }
        if (value == StateGold.FINISH_KEY) {

            this.room.mill.setState(MillState.DONE)
        }
        if (value == StateGold.FIND_NOTE || value == StateGold.GET_SHOVEL || value == StateGold.GET_GOLD) {
            this.dayNight = 1;
            this.renderer.modelByLabel["grave"].enableHitTest = true
            this.renderer.modelByLabel["cross"].enableHitTest = false
        } else {
            this.dayNight = 0;
            this.renderer.modelByLabel["grave"].enableHitTest = false
            this.renderer.modelByLabel["cross"].enableHitTest = true
        }
        if(value == StateGold.GET_GOLD){
           this.renderer.modelByLabel["cross"].setEuler(Math.PI/2,0.5,0)
            this.renderer.modelByLabel["grave"].setPosition(-24.0,0,-1.3)
            this.characterPos.set(-24.8,-1,-2)
           this.offsetY =-0.5
            //this.sceneHeight =2.5;
        }if(value == StateGold.OUTRO){
            this.offsetY =0;
            //this.sceneHeight =2.5;
        }


        this._stateGold = value;
    }

    private _stateFashion: StateFasion = StateFasion.START

    get stateFashion(): StateFasion {
        return this._stateFashion;
    }

    set stateFashion(value: StateFasion) {
        this.room.laptopScreen.setState(value);
        this._stateFashion = value;
        if (this._stateFashion == StateFasion.GET_FASION_PANTS) {
            this.outside.mailBox.setState(1)
            this.renderer.modelByLabel["labtop"].enableHitTest = false;
        } else if (this._stateFashion == StateFasion.TAKE_FASION_PANTS) {
            this.renderer.modelByLabel["labtop"].enableHitTest = false;
        } else {
            this.outside.mailBox.setState(0)
            this.renderer.modelByLabel["labtop"].enableHitTest = true;
        }
    }

    private _stateGirl: StateGirl = StateGirl.START;

    get stateGirl(): StateGirl {

        return this._stateGirl;
    }

    set stateGirl(value: StateGirl) {
        if (value == StateGirl.START) {
            this.renderer.modelByLabel["stickHold"].visible = false;
            this.renderer.modelByLabel["girlPants"].visible = false;
            this.renderer.modelByLabel["girlPants"].enableHitTest = false;

            this.renderer.modelByLabel["stick"].visible = false;
            this.renderer.modelByLabel["stick"].enableHitTest = false;
        } else if (value == StateGirl.BIRD_HOUSE_FELL) {
            this.renderer.modelByLabel["stick"].visible = true;
            this.renderer.modelByLabel["stick"].enableHitTest = true;

            this.renderer.modelByLabel["birdHouse"].setEuler(0, 0, 0.6);
        } else if (value == StateGirl.TAKE_GIRL_PANTS) {
            this.renderer.modelByLabel["girlPants"].visible = false;
            this.renderer.modelByLabel["girlPants"].enableHitTest = false;
        }
        this._stateGirl = value;
    }

    private _stateGrandpa: StateGrandpa = StateGrandpa.START;

    get stateGrandpa(): StateGrandpa {
        return this._stateGrandpa;
    }

    set stateGrandpa(value: StateGrandpa) {


        if (value == StateGrandpa.SHOW_GRANDPA_PANTS) {
            this.renderer.modelByLabel["grandpaPants"].visible = true;
            this.renderer.modelByLabel["grandpaPants"].enableHitTest = true;
        } else {
            this.renderer.modelByLabel["grandpaPants"].visible = false;
            this.renderer.modelByLabel["grandpaPants"].enableHitTest = false;
        }
        this._stateGrandpa = value;
    }

    private _stateHighTech = StateHighTech.START

    get stateHighTech(): StateHighTech {
        return this._stateHighTech;
    }

    set stateHighTech(value: StateHighTech) {
        if (value == StateHighTech.START) {
            this.renderer.modelByLabel["glowFlower"].visible = false
            this.renderer.modelByLabel["glowFlower"].enableHitTest = false
            this.renderer.modelByLabel["glowFlowerStem"].visible = false
            this.renderer.modelByLabel["pot"].enableHitTest = true
            this.renderer.modelByLabel["Bush3"].enableHitTest = true
            this.renderer.modelByLabel["pantsGlow"].enableHitTest = false
            this.renderer.modelByLabel["pantsGlow"].visible = true

            this.renderer.modelByLabel["glowFlowerKnob"].visible = true
        } else if (value == StateHighTech.GROW_FLOWER) {
            this.renderer.modelByLabel["glowFlower"].visible = true
            this.renderer.modelByLabel["glowFlower"].enableHitTest = true
            this.renderer.modelByLabel["glowFlowerStem"].visible = true
            this.renderer.modelByLabel["pot"].enableHitTest = false
            this.renderer.modelByLabel["Bush3"].enableHitTest = false
            this.renderer.modelByLabel["glowFlowerKnob"].visible = false
        } else {
            this.renderer.modelByLabel["glowFlower"].visible = false
            this.renderer.modelByLabel["glowFlower"].enableHitTest = false
            this.renderer.modelByLabel["glowFlowerStem"].visible = true
            this.renderer.modelByLabel["glowFlowerKnob"].visible = false
            this.renderer.modelByLabel["glowFlowerKnob"].enableHitTest = false
            this.renderer.modelByLabel["pot"].enableHitTest = false
            this.renderer.modelByLabel["Bush3"].enableHitTest = false
        }
        if (value == StateHighTech.START_MACHINE) {
           // if (this.pantsFound.length >= 5) {
               // this.room.machine.start(true)
           // } else {
             //   this.room.machine.start(false)
           // }


        }
        if (value == StateHighTech.STOP_MACHINE) {
            this.room.machine.stop()
            this.renderer.modelByLabel["pantsGlow"].enableHitTest = true;
        }
        if (value == StateHighTech.TAKE_HIGHTECH_PANTS) {
            this.renderer.modelByLabel["pantsGlow"].enableHitTest = false;
            this.renderer.modelByLabel["pantsGlow"].visible = false;

        }

        this._stateHighTech = value;
    }

    private _hitObjectLabel: string = "";

    get hitObjectLabel(): string {
        return this._hitObjectLabel;
    }

    set hitObjectLabel(value: string) {

        if (value == this._hitObjectLabel) {

            if (this.lastClickLabels.length) {
                if (!this.lastClickLabels.includes(value)) {
                    this.emptyValueCount++;
                    if (this.emptyValueCount > 5) {
                        this.lastClickLabels = [];
                    }
                }

            }

            return;
        }
        if (this.lastClickLabels.includes(value)) {
            if (this.floorLabels.includes(value)) {

            } else {

                this.emptyValueCount = 0;
                return;
            }


        }
        if (value != "") {
            this.lastClickLabels = []
        }

        this.hitStateChange = true;
        this.hitObjectLabelPrev = this._hitObjectLabel;
        this._hitObjectLabel = value;
        if (this.debug) UI.logEvent("Hit", value);

    }

    setMillState(state: MillState) {
        this.millState = state;
        this.room.mill.setState(state);
    }


    update() {

        this.screenWidth = this.renderer.width / this.renderer.pixelRatio;
        this.screenHeight = this.renderer.height / this.renderer.pixelRatio;

        if (this.currentTransition) {
            if (this.mouseDownThisFrame) this.currentTransition.onMouseDown()

        } else if (this.mouseDownThisFrame) {
            this.textHandler.hideHitTrigger()
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
        this.outlinePass.setModel(null);

        this.gameUI.cursor.hide()
        this.setUIState(UIState.HIDE_MENU)
        t.set(this.transitionComplete.bind(this), data);
    }

    transitionComplete() {

        this.mouseDownThisFrame = false
        this.catchMouseDown = false;
        this.prevTransition = this.currentTransition;
        this.currentTransition = null;
        this.setUIState(UIState.GAME_DEFAULT)
    }


    getDrawingByLabel(label: string) {
        console.log( this.drawingByLabel)
        return this.drawingByLabel[label];
    }

    getCharacterScreenPos() {
        this.characterScreenPos.from(this.characterPos)

        this.gameCamera.getScreenPos(this.characterScreenPos)
        this.characterScreenPos.scale(0.5)
        this.characterScreenPos.add([0.5, 0.5, 0])
        this.characterScreenPos.scale([this.screenWidth, this.screenHeight, 1])
        return this.characterScreenPos;
    }

    init() {
        this.textHandler.init()
        for (let d of this.textHandler.hitTriggers) {

            this.triggers.push(new HitTextTrigger(d.scene, d.object))
        }

        this.stateGrandpa = StateGrandpa.START;
        this.stateGirl = StateGirl.START;
        this.stateHighTech = StateHighTech.START;
        this.stateFashion = StateFasion.START;
        this.stateGold = StateGold.START;
    }


    setUIState(state: UIState, data: any = null,hasClose:boolean=false) {
        this.gameUI.setUIState(state, data,hasClose);

        if (state == UIState.OPEN_MENU || state == UIState.INVENTORY_DETAIL) {
            RenderSettings.openMenu()
            this.uiOpen = true;

        } else if (state == UIState.GAME_DEFAULT) {
            RenderSettings.closeMenu()
            this.uiOpen = false;
        }
    }

    usePants(id: number) {
        if (this.currentPants == id) {
            this.setTransition(Transitions.WEAR_PANTS, "")
            return;
        }
        this.sound.playPants();
        this.setTransition(Transitions.WEAR_PANTS, id + "")
        this.characterHandler.characterRot = 0;
        this.characterHandler.pullPants()
        this.currentPants = id;
        this.characterHandler.setPants(id)
    }

    makeTriggers() {
        this.triggers.push(new GrandpaFishTrigger(Scenes.OUTSIDE))
        this.triggers.push(new DigGraveTrigger(Scenes.OUTSIDE, ["grave"]))
        this.triggers.push(new KeyTrigger(Scenes.ROOM, ["key"]))
        this.triggers.push(new HighTechPantsTrigger(Scenes.ROOM, ["pantsGlow"]))
        this.triggers.push(new PackageTrigger(Scenes.OUTSIDE, ["package"]));
        this.triggers.push(new MailBoxTrigger(Scenes.OUTSIDE, ["mailBox", "mailBoxDoor", "mailBoxFlag"]));
        this.triggers.push(new BirdHouseTrigger(Scenes.OUTSIDE, ["birdHouse"]));
        this.triggers.push(new FishTrigger(Scenes.OUTSIDE, ["fishHit"]));
        this.triggers.push(new GirlPantsTrigger(Scenes.OUTSIDE, ["girlPants"]));
        this.triggers.push(new GrandpaPantsTrigger(Scenes.OUTSIDE, ["grandpaPants"]));
        this.triggers.push(new ShovelTrigger(Scenes.OUTSIDE, ["shovel"]));
        this.triggers.push(new StickTrigger(Scenes.OUTSIDE, ["stick"]));
        this.triggers.push(new FishFoodTrigger(Scenes.ROOM, ["fishFood"]));
        this.triggers.push(new MachineHitTrigger(Scenes.ROOM, ["coffeeMaker", "coffeeControler", "flask_G"]));
        this.triggers.push(new FlowerHitTrigger(Scenes.OUTSIDE, ["glowFlower"]));
        this.triggers.push(new FlowerPotHitTrigger(Scenes.OUTSIDE, ["pot", "Bush3","glowFlowerKnob"]));
        this.triggers.push(new GoHunterTrigger(Scenes.OUTSIDE, "hunterPants"));
        this.triggers.push(new GoGraveTrigger(Scenes.OUTSIDE, "cross"));
        this.triggers.push(new DoorGoOutsideTrigger(Scenes.ROOM, "door_HO"));
        this.triggers.push(new DoorGoInsideTrigger(Scenes.OUTSIDE, "door"));
        this.triggers.push(new DoorInsideTrigger(Scenes.ROOM, "_HitCenterDoor"));
        this.triggers.push(new SitTrigger(Scenes.ROOM, "chair"));
        this.triggers.push(new GoWorkTrigger(Scenes.ROOM, "labtop"));
        this.triggers.push(new MillTrigger(Scenes.ROOM, ["mill", "millBed", "millControle", "millHead"]));
        this.triggers.push(new BookCaseTrigger(Scenes.ROOM, ["bookCaseDoorRight", "bookCaseDoorLeft"]));
        this.triggers.push(new FloorHitTrigger(Scenes.ROOM, ["_HitRightRoom", "_HitLeftRoomCenter", "_HitLeftRoomRight", "_HitLeftRoomLeft"]))
        this.triggers.push(new FloorHitTrigger(Scenes.OUTSIDE, ["_HitGround"]))

        for (let t of this.triggers) {
            t.init()
        }
        this.floorLabels = ["_HitGround", "_HitRightRoom", "_HitLeftRoomCenter", "_HitLeftRoomRight", "_HitLeftRoomLeft"]
        this.stateHighTech = StateHighTech.START;
    }

    public stopWalking() {
        if (this.characterHandler.isWalking) return
        if (this.currentTransition != null) return
        let s = this.prevTransition.name;
        this.stopCount++

// has outside pants and didnts start working && outside
        if (this.pantsFound.length == 3 && this.stateFashion == StateFasion.READ_MAIL_DONE) {
            if (this.stopCount % 3 == 0) {
                this.setTransition(Transitions.TEXT_INFO_LOCK, "shouldDoWork")
            }
        }

        if (s == "Inside") {


        }
        if (s == "Outside") {
            if (this.stateGirl == StateGirl.BIRD_HOUSE_FELL) {
                this.prevTransition = null;
                this.setTransition(Transitions.TEXT_INFO_LOCK, "lookBirdHouse")
            } else if (this.stateHighTech == StateHighTech.GROW_FLOWER) {
                this.prevTransition = null;
                this.setTransition(Transitions.TEXT_INFO_LOCK, "lookFlower")

            } else if (this.stateFashion == StateFasion.GET_FASION_PANTS) {
                this.prevTransition = null;
                this.setTransition(Transitions.TEXT_INFO_LOCK, "checkMailForPackage")
            } else {

            }

        }

    }

    prepUI() {

        this.millSelect = UIUtils.EnumToSelectItem(MillState)
        this.highTechSelect = UIUtils.EnumToSelectItem(StateHighTech)
        this.girlSelect = UIUtils.EnumToSelectItem(StateGirl)
        this.grandpaSelect = UIUtils.EnumToSelectItem(StateGrandpa)
        this.fashionSelect = UIUtils.EnumToSelectItem(StateFasion)
        this.goldSelect = UIUtils.EnumToSelectItem(StateGold)
    }

    onUI() {
        UI.pushWindow("GameModel")
        UI.separator("GameState")
        let sht = UI.LSelect("HighTechPants", this.highTechSelect, this._stateHighTech)
        if (sht != this._stateHighTech) this.stateHighTech = sht

        let sg = UI.LSelect("GirlPants", this.girlSelect, this._stateGirl)
        if (sg != this._stateGirl) this.stateGirl = sg;

        let sgp = UI.LSelect("GrandpaPants", this.grandpaSelect, this._stateGrandpa)
        if (sgp != this._stateGrandpa) this.stateGrandpa = sgp;

        let sf = UI.LSelect("FashionPants", this.fashionSelect, this._stateFashion)
        if (sf != this._stateFashion) this.stateFashion = sf;

        let sgo = UI.LSelect("GoldPants", this.goldSelect, this._stateGold)
        if (sgo != this._stateGold) this.stateGold = sgo;

        UI.separator("objects")
        if (UI.LButton("AllPants")) {
            this.pantsFound = [0, 1, 2, 3, 4, 5, 6]
            this.gameUI.updateInventory();
        }


        let ms = UI.LSelect("mill", this.millSelect, this.millState)
        if (ms != this.millState) this.setMillState(ms);

        UI.popWindow()
    }

}

export default new GameModel()


import Transition from "./transitions/Transition";
import GoOutside from "./transitions/GoOutside";
import StartGame from "./transitions/StartGame";
import {Vector2, Vector3} from "math.gl";
import Main from "./Main";
import GoInside from "./transitions/GoInside";
import mapRange = gsap.utils.mapRange;
import Trigger from "./trigers/Trigger";
import HitTrigger from "./trigers/HitTrigger";
import UI from "./lib/UI/UI";
import HitInfoTrigger from "./trigers/HitInfoTrigger";
import Texture from "./lib/textures/Texture";
import Drawing from "./drawing/Drawing";
import GoRightRoom from "./transitions/GoRightRoom";
import GoLeftRoom from "./transitions/GoLeftRoom";



export const Transitions=
{
   GO_OUTSIDE:new GoOutside() ,
    START_GAME:new StartGame() ,
    GO_INSIDE:new GoInside(),
    GO_RIGHT_ROOM: new GoRightRoom(),
    GO_LEFT_ROOM:  new GoLeftRoom(),


}
export enum Scenes
{
        OUTSIDE,
        ROOM
}
class GameModel {

    public roomCamOffset:number =-1;
    public isLeftRoom =true;

    public currentScene:Scenes =Scenes.ROOM

    public yMouseCenter: number = 1;
    public yMouseScale: number = 1;
    public sceneHeight =3;
    public main:Main;
    public mouseDownThisFrame: boolean =false;
    public mousePos: Vector2=new Vector2();

    public characterPos: Vector3 = new Vector3(0, 0, 0);
    dayNight: number = 0;
    lockView: boolean =false;

    public drawingByLabel: { [label: string]: Drawing } = {};
    private triggers:Array<Trigger>=[]

    private _hitObjectLabel: string ="";
   public hitStateChange: boolean =false;
    public hitObjectLabelPrev: string ="";
    constructor() {

        this.makeTriggers();
    }
    private makeTriggers() {
        this.triggers.push(new HitInfoTrigger(Scenes.ROOM, "door_HO"))
    }
    update(){
        for(let t of this.triggers){
            t.check();
        }
        this.hitStateChange =false;
    }


    public setScene(scenes:Scenes){
        this.main.setScene(scenes);
        this.currentScene =scenes;
    }
    setTransition(t:Transition){
        t.set(this.transitionComplete.bind(this));
    }
    transitionComplete(){
       // console.log("complete")
    }
    get hitObjectLabel(): string {
        return this._hitObjectLabel;
    }

    set hitObjectLabel(value: string) {
        if(value == this._hitObjectLabel){
            return;
        }


        this.hitStateChange =true;
        this.hitObjectLabelPrev =   this._hitObjectLabel;
        this._hitObjectLabel = value;
    }


    getDrawingByLabel(label: string) {
        return this.drawingByLabel[label];
    }
}

export default new GameModel()


import Transition from "./transitions/Transition";
import GoOutside from "./transitions/GoOutside";
import StartGame from "./transitions/StartGame";
import {Vector2, Vector3} from "math.gl";
import Main from "./Main";
import GoInside from "./transitions/GoInside";
import mapRange = gsap.utils.mapRange;



export const Transitions=
{
   GO_OUTSIDE:new GoOutside() ,
    START_GAME:new StartGame() ,
    GO_INSIDE:new GoInside(),


}
export enum Scenes
{
        OUTSIDE,
        ROOM
}
class GameModel {



    public currentScene:Scenes =Scenes.ROOM
    public yMouseCenter: number = 1;
    public yMouseScale: number = 1;
    public sceneHeight =3;
    public main:Main;
    public mouseDownThisFrame: boolean =false;
    public mousePos: Vector2=new Vector2();

    public characterPos: Vector3 = new Vector3(0, 0, 0);
    dayNight: number = 0;
    constructor() {
    }





    public setScene(scenes:Scenes){
        this.main.setScene(scenes);
        this.currentScene =scenes;
    }
    setTransition(t:Transition){
        t.set(this.transitionComplete.bind(this));
    }
    transitionComplete(){
        console.log("complete")
    }

}

export default new GameModel()


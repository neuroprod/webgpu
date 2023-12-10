import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import DrawingLoader from "./DrawingLoader";
import Drawing from "./Drawing";
import GameModel from "../GameModel";


export default class DrawingPreloader{

    public drawings:Array<Drawing>=[]
    constructor() {

    }

    load(renderer:Renderer,preloader:PreLoader) {
        let drawings =["bird_birdHouse","fish_world","gooutside_door_HO","house_house","woods_world","demon_world","demonback_world","nice_world"];

        for(let file of drawings){

            let name = "drawings/"+file+".bin";

            let drawing =     new DrawingLoader(renderer,preloader,name);
            GameModel.drawingByLabel[file] =drawing;
            this.drawings.push(drawing)
        }

    }


}

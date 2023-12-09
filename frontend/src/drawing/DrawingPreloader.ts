import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import DrawingLoader from "./DrawingLoader";
import Drawing from "./Drawing";


export default class DrawingPreloader{

    public drawings:Array<Drawing>=[]
    constructor() {

    }

    load(renderer:Renderer,preloader:PreLoader) {
        let drawings =["bird_birdHouse","fish_world","gooutside_door_HO","house_house","woods_world","demon_world","demonback_world","nice_world"];

        for(let files of drawings){

            let name = "drawings/"+files+".bin";

            let drawing =     new DrawingLoader(renderer,preloader,name);
            this.drawings.push(drawing)
        }

    }


}

import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import DrawingLoader from "./DrawingLoader";
import Drawing from "./Drawing";
import GameModel from "../../public/GameModel";
import {preloadDrawings} from "../PreloadData";


export default class DrawingPreloader {

    public drawings: Array<Drawing> = []

    constructor() {

    }

    load(renderer: Renderer, preloader: PreLoader) {
        let drawings = preloadDrawings

        for (let file of drawings) {

            let name = "drawings/" + file + ".bin";

            let drawing = new DrawingLoader(renderer, preloader, name);
            GameModel.drawingByLabel[file] = drawing;
            this.drawings.push(drawing)
        }

    }


}

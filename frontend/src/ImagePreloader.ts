import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import {preloadImages} from "./PreloadData";
import TextureLoader from "./lib/textures/TextureLoader";
import GameModel from "../public/GameModel";


class ImagePreloader {


    constructor() {

    }

    load(renderer: Renderer, preloader: PreLoader) {
        let delay = 100;
        for (let img of preloadImages) {
            if (GameModel.devSpeed) delay = 0;

            let name = "textures/" + img + ".webp";
            if (renderer.texturesByLabel[name] == undefined) {

                new TextureLoader(renderer, preloader, "textures/" + img + ".webp", {mipLevelCount: 5}, delay);
            }

            delay += 16;
        }

    }


}

export default new ImagePreloader()

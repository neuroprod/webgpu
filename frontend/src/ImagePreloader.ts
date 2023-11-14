import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import {preloadImages} from "./PreloadData";
import TextureLoader from "./lib/loaders/TextureLoader";
import Texture from "./lib/textures/Texture";

 class ImagePreloader{

    private textureByName:{ [name: string]: Texture } = {};
    constructor() {

    }

    load(renderer:Renderer,preloader:PreLoader) {

        for(let img of preloadImages){

            this.textureByName[img] =new TextureLoader(renderer,preloader,"textures/"+img+".png",{});
        }
    }
    getTexture(name:string){

        return this.textureByName[name];
    }

}
export default new ImagePreloader()

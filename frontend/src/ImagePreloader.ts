import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import {preloadImages} from "./PreloadData";
import TextureLoader from "./lib/textures/TextureLoader";


 class ImagePreloader{


    constructor() {

    }

    load(renderer:Renderer,preloader:PreLoader) {

        for(let img of preloadImages){

            let name = "textures/"+img+".png";
            if(renderer.texturesByLabel[name]== undefined){
                new TextureLoader(renderer,preloader,"textures/"+img+".png",{mipLevelCount:5});
            }
        }
        console.log(renderer.texturesByLabel)
    }


}
export default new ImagePreloader()

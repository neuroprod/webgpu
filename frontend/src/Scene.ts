import Renderer from "./lib/Renderer";
import PreLoader from "./lib/PreLoader";
import GLFTLoader from "./GLFTLoader";
import Ray from "./lib/Ray";
import GameModel from "./GameModel";
import UI from "./lib/UI/UI";

export default class Scene{
    public renderer: Renderer;
   public glFTLoader: GLFTLoader;
    constructor(renderer: Renderer, preloader: PreLoader,glft:string) {
        this.renderer =renderer;
        this.glFTLoader = new GLFTLoader(this.renderer, glft, preloader);
    }

    checkMouseHit(mouseRay: Ray) {
        let label =""

//TODO check closest hit
        for (let m of this.glFTLoader.modelsHit) {
            if(!m.needsHitTest)continue;

            if( m.checkHit(mouseRay)){
                label =m.label

                GameModel.hitWorldPos =  m.getWorldPos(m.hitTestObject.localPos)
                GameModel.hitWorldNormal =m.hitTestObject.localNormal;//.transform( m.worldMatrix) //transform by normal matrix?
            }else{

            }
        }

        GameModel.hitObjectLabel =label

    }


}

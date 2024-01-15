import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";


export default class CloseButton extends UIBitmapModel{


    constructor(renderer:Renderer,preLoader:PreLoader,label:string) {
        super(renderer,preLoader,label,"UI/closeBtn.png");
    }
    update() {
        super.update();

    }

    onOver() {

        super.onOver();

    }
    onOut() {

        super.onOut();

    }


}

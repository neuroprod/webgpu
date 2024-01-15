import UIBitmapModel from "../lib/model/UIBitmapModel";
import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";

export default class InventoryButton extends UIBitmapModel{
   public id: number;


    constructor(renderer:Renderer,preLoader:PreLoader,url,id:number) {
        super(renderer,preLoader,url,url);
        this.id =id;
        this.mouseEnabled =false;
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

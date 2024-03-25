import Transition from "./Transition";
import GameModel, {Pants, Scenes, StateGold, UIState} from "../GameModel";
import RenderSettings from "../RenderSettings";

export default class DigGrave extends Transition{


    set(onComplete: () => void){
        super.set(onComplete)
      //  GameModel.textHandler.showHitTrigger("digGrave")
        GameModel.renderer.modelByLabel["shovelHold"].visible =true
        GameModel.characterHandler.setAnimation("digging",0.3);
        setTimeout(()=>{GameModel.sound.playShovel()},700)
       // GameModel.gameUI.cursor.show(CURSOR.NEXT)
      RenderSettings.fadeToBlack(1,2)
        setTimeout(()=> {
            GameModel.stateGold = StateGold.GET_GOLD
            RenderSettings.fadeToScreen(1)
            GameModel.renderer.modelByLabel["shovelHold"].visible = false
            GameModel.renderer.modelByLabel["skeleton"].visible = true
            GameModel.renderer.modelByLabel["skeletonPants"].visible = true
            GameModel.characterHandler.face.lookGold();
            GameModel.characterHandler.setAnimationOnce("goldPants", 0, () => {
                RenderSettings.fadeToBlack(1, 4);
                setTimeout(() => {
                    GameModel.characterHandler.face.setToBase()
                    GameModel.stateGold = StateGold.OUTRO;
                    GameModel.characterHandler.setPants(6)
                    GameModel.characterHandler.setIdleAndTurn()
                    GameModel.renderer.modelByLabel["coffee"].visible =false;
                    GameModel.setScene(Scenes.PRELOAD)
                    RenderSettings.fadeToScreen(1)
                }, 5000);
            });
        },4000);

    }
    onMouseDown(){
        return;
        GameModel.gameUI.cursor.animate()
        if(GameModel.textHandler.readNext()){

            GameModel.pantsFound.push(Pants.gold);
            GameModel.gameUI.updateInventory();
            GameModel.sound.playPickPants();
            GameModel.gameUI.cursor.hide()
            GameModel.stateGold =StateGold.GET_GOLD
            GameModel.renderer.modelByLabel["shovelHold"].visible =false
            GameModel.characterHandler.setIdleAndTurn()
           // this.onComplete()
            GameModel.setUIState(UIState.INVENTORY_DETAIL,Pants.gold)





        }
    }
}

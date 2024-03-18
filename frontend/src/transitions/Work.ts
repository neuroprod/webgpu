import Transition from "./Transition";
import GameModel, {StateFasion, StateGirl, StateHighTech} from "../GameModel";
import {CURSOR} from "../ui/Cursor";

export default class Work extends Transition{

public state =0;
    set(onComplete: () => void){
        super.set(onComplete)
        this.state =0;
        GameModel.characterHandler.startTyping()
        if(GameModel.stateFashion ==StateFasion.CAN_MAKE_TRIANGLE){
            GameModel.textHandler.showHitTrigger("makeTriangle")
            GameModel.stateFashion = StateFasion.MAKE_TRIANGLE
            GameModel.gameUI.cursor.show(CURSOR.NEXT)
            GameModel.stateHighTech =StateHighTech.GROW_FLOWER;
            GameModel.stateGirl =StateGirl.BIRD_HOUSE_FELL;

        }  if(GameModel.stateFashion ==StateFasion.CAN_FINISH_WEBSITE){
            GameModel.textHandler.showHitTrigger("makeWebsite")
            GameModel.stateFashion = StateFasion.FINISH_WEBSITE
        }
      //  GameModel.setLaptopState(LaptopState.TRIANGLE)

    }
    onMouseDown(){

        if( this.state==1 )return;
        GameModel.gameUI.cursor.animate()

        if( this.state==0 &&GameModel.textHandler.readNext()){

            this.state =1;
            GameModel.gameUI.cursor.hide()
            let obj = GameModel.renderer.modelByLabel["labtop"]
            let world = obj.getWorldPos()
            world.z+=1.1;
            world.x-=0.5;

            GameModel.characterHandler.walkTo(world,0,this.onEndWalkDone.bind(this))


        }

        if(this.state==2 && GameModel.textHandler.readNext() ){
            GameModel.gameUI.cursor.hide()
            if(GameModel.stateFashion ==StateFasion.MAKE_TRIANGLE)
            { GameModel.stateFashion =StateFasion.MAKE_TRIANGLE_DONE;}
            if(GameModel.stateFashion ==StateFasion.FINISH_WEBSITE)
            { GameModel.stateFashion =StateFasion.FINISH_WEBSITE_DONE}
            this.onComplete()
        }

    }
    onEndWalkDone(){
        this.state =2;
        GameModel.gameUI.cursor.show(CURSOR.NEXT)
        if(GameModel.stateFashion ==StateFasion.MAKE_TRIANGLE)
        { GameModel.textHandler.showHitTrigger("makeTriangleDone")}
        if(GameModel.stateFashion ==StateFasion.FINISH_WEBSITE)
        { GameModel.textHandler.showHitTrigger("makeWebsiteDone")}

    }
}

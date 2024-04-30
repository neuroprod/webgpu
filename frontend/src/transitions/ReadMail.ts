import Transition from "./Transition";
import GameModel, {StateFasion} from "../../public/GameModel";
import {CURSOR} from "../ui/Cursor";

export default class ReadMail extends Transition {
    public state = 0;
    private lockMouse: boolean;

    set(onComplete: () => void) {
        super.set(onComplete)
        this.lockMouse = true;
        this.state = 0;
        GameModel.characterHandler.setMixAnimation("lookdown", 0.8, 0.3)
        GameModel.characterHandler.setAnimationOnce("hitKey", 0, () => {
            this.lockMouse = false;
            GameModel.characterHandler.setAnimation("idle")
            if (GameModel.stateFashion == StateFasion.START) {
                GameModel.textHandler.showHitTrigger("readMail")
                GameModel.stateFashion = StateFasion.READ_MAIL;
            }
            if (GameModel.stateFashion == StateFasion.CAN_READ_MAIL_MAILBOX) {
                GameModel.textHandler.showHitTrigger("readMailAward")
                GameModel.stateFashion = StateFasion.READ_MAIL_MAILBOX;
            }
            // GameModel.setLaptopState(LaptopState.NONE)
            GameModel.gameUI.cursor.show(CURSOR.NEXT)
        })

    }

    onMouseDown() {
        if (this.lockMouse) return;
        GameModel.gameUI.cursor.animate()
        if (this.state == 0) {
            if (GameModel.textHandler.readNext()) {
                GameModel.characterHandler.setMixAnimation("lookdown", 0.0, 0.3)

                GameModel.characterHandler.setIdleAndTurn()
                if (GameModel.stateFashion == StateFasion.READ_MAIL) {

                    GameModel.textHandler.showHitTrigger("letsGoOutsideFirst");
                }
                if (GameModel.stateFashion == StateFasion.READ_MAIL_MAILBOX) {

                    GameModel.textHandler.showHitTrigger("checkMailBox");
                }
                this.state = 1

            }
        } else if (this.state == 1) {
            if (GameModel.textHandler.readNext()) {
                GameModel.gameUI.cursor.hide();

                if (GameModel.stateFashion == StateFasion.READ_MAIL) {
                    GameModel.stateFashion = StateFasion.READ_MAIL_DONE;
                    // GameModel.getDrawingByLabel("chapter1_world").show();
                }
                if (GameModel.stateFashion == StateFasion.READ_MAIL_MAILBOX) {
                    GameModel.stateFashion = StateFasion.GET_FASION_PANTS;

                }


                this.onComplete()

            }
        }
    }
}

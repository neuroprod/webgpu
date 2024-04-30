import Trigger from "./Trigger";
import GameModel, {Scenes} from "../../public/GameModel";
import {isArray} from "math.gl";


export default class HitTrigger extends Trigger {

    protected objectLabels: Array<string> = [];

    constructor(scene: Scenes, objectLabel: string | Array<string>) {
        super(scene);
        if (isArray(objectLabel)) {
            this.objectLabels = objectLabel as Array<string>;

        } else {
            this.objectLabels.push(objectLabel as string);

        }


    }

    init() {
        let firstObject = this.objectLabels[0]
        let mF = GameModel.renderer.modelByLabel[firstObject]
        for (let label of this.objectLabels) {
            let obj = GameModel.renderer.modelByLabel[label]
            if (obj.hitTestObject) {
                obj.hitLabel = mF.label;
                if (mF != obj) {
                    mF.hitFriends.push(obj);
                }
            }

        }
    }

    check() {
        if (!super.check()) return false;

        if (GameModel.mouseDownThisFrame) {
            if (this.objectLabels.includes(GameModel.hitObjectLabel)) {
                GameModel.lastClickLabels = this.objectLabels;
                this.click()

            }

        }


        if (!GameModel.hitStateChange) return
        if (this.objectLabels.includes(GameModel.hitObjectLabel)) {
            this.over()
            return true;
        }
        if (this.objectLabels.includes(GameModel.hitObjectLabelPrev)) {
            this.out()
            return true;
        }


    }

    protected over() {
        //UI.logEvent("Over", this.objectLabel);
    }

    protected out() {
        //  UI.logEvent("Out", this.objectLabel);
    }

    protected click() {

    }
}

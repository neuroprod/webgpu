import Animation from "./Animation";
import UI from "../UI/UI";
import GameModel from "../../../public/GameModel";

export default class AnimationMixer {
    public animationsByName: { [name: string]: Animation } = {};
    public mixValue: number = 1;
    public anime2: Animation;
    public currentAnimation: Animation;
    private animations: Array<Animation>;
    private extraAnime: Animation;
    private anime1: Animation;

    constructor() {

    }

    setAnimations(animations: Array<Animation>) {
        this.animations = animations;

        for (let a of this.animations) {
            this.animationsByName[a.label] = a;

        }
        this.animationsByName["coffee"].setAsMixAnimation(["RightArm", "RightFore", "RightHand", "RightShoulder"])
        this.animationsByName["holding"].setAsMixAnimation(["RightArm", "RightFore", "RightHand", "RightShoulder"])
        this.animationsByName["grabGlowPants"].setAsMixAnimation(["RightArm", "RightFore", "RightHand", "RightShoulder"])
        this.animationsByName["grabHigh"].setAsMixAnimation(["RightArm", "RightFore", "RightHand", "RightShoulder"])
        this.animationsByName["lookdown"].setAsMixAnimation(["Neck", "Spine2", "Head"])
        this.anime1 = this.animationsByName["idle"]
        this.anime2 = this.animationsByName["idle"]
        this.anime2.speedMultiplier = 1;
        this.animationsByName["pullPants"].speedMultiplier = 0.6;
        this.animationsByName["birdHouse2"].speedMultiplier = 0.5;
        this.animationsByName["walking"].speedMultiplier = 1.2;

        let walking = this.animationsByName["walking"];
        walking.setCallBack(31 * (1 / 30), () => {
            GameModel.sound.playFootstep()
        })
        walking.setCallBack(11 * (1 / 30), () => {
            GameModel.sound.playFootstep()
        })


        this.animationsByName["hitKey"].setCallBack(14 * (1 / 30), () => {
            GameModel.sound.playClick(2)
        })

    }

    addAnimations(animations: Array<Animation>) {
        for (let a of animations) {
            this.animationsByName[a.label] = a;
            this.animations.push(a)
        }
    }


    onUI() {
        UI.pushWindow("Animation")
        for (let a of this.animations) {

            if (!a.isMixAnimation) {
                if (UI.LButton(a.label)) {
                    this.setAnimation(a.label);
                    this.mixValue = 1;
                }
            }
        }
        for (let a of this.animations) {

            if (a.isMixAnimation) {
                a.mixValue = UI.LFloatSlider(a.label, a.mixValue, 0, 1);

            }
        }
        UI.popWindow()
    }

    update() {
        if (this.extraAnime) {
            console.log("extra")
            this.extraAnime.update()
            this.extraAnime.set();
            if (this.extraAnime.animationDone) {
                this.extraAnime = null;
                console.log("extraDone")
            }
        }

        if (this.mixValue < 0.01) {
            this.anime1.update()

            this.currentAnimation = this.anime1;

        } else if (this.mixValue > 0.99) {
            this.anime2.update()
            this.currentAnimation = this.anime2;


        } else {
            this.anime1.update()
            this.anime2.update()

            for (let i = 0; i < this.anime1.channels.length; i++) {
                if (this.anime1.channels[i].target != this.anime2.channels[i].target) {
                    console.log("fail");
                }

                this.anime1.channels[i].mix(this.anime2.channels[i].result, this.mixValue)


            }
            this.currentAnimation = this.anime1;


        }
        for (let mix of this.animations) {

            if (mix.isMixAnimation && mix.mixValue > 0) {
                mix.update();

                for (let m of mix.channels) {

                    let c = this.currentAnimation.channelsByName[m.name];
                    c.mix(m.result, mix.mixValue)

                }
            }
        }
        this.currentAnimation.set();
    }

    setAnimation(name: string, startTime = 0) {

        this.anime1 = this.anime2
        this.anime2 = this.animationsByName[name]
        this.currentAnimation = this.anime2
        this.anime2.setStartValue()
        this.anime2.time = 0;
        this.mixValue = 0;
        // this.animation2 = this.getAnimationIndexByName()

    }

    setExtraAnime(animation: string, callBack: () => void) {
        this.extraAnime = this.animationsByName[animation]
        if (animation == "pantsFall") this.extraAnime.speedMultiplier = 2;

        this.extraAnime.animationDone = false;
        this.extraAnime.playOnce = true;
        this.extraAnime.time = 0;
        this.extraAnime.completeCallBack = callBack;
    }

    setAnimationOnce(animation: string, callBack: () => void) {
        this.anime1 = this.anime2
        this.anime2 = this.animationsByName[animation]
        this.anime2.setStartValue()
        this.anime2.animationDone = false;
        this.anime2.playOnce = true;
        this.anime2.time = 0;
        this.anime2.completeCallBack = callBack;

        this.mixValue = 0;

    }
}

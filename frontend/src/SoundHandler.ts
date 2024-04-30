import PreLoader from "./lib/PreLoader";
import {Howl} from 'howler';

import GameModel, {Scenes} from "../public/GameModel";

export default class SoundHandler {
    private stepInside: Howl;
    private stepOutside: Howl;
    private bg: Howl;
    private door: Howl;
    private forest: Howl;
    private clicks: Howl;
    private wooshes: Howl;
    private knock: Howl;
    private pants: Howl;
    private fxVolume: number = 1;
    private pickPants: Howl;
    private drip: Howl;
    private fishFood: Howl;
    private shovel: Howl;
    private typing: Howl;

    constructor(preloader: PreLoader) {

        this.fishFood = new Howl({src: ['sound/fishfood.mp3']});

        this.shovel = new Howl({src: ['sound/shovel.mp3']});
        this.typing = new Howl({src: ['sound/typingLong.mp3'], loop: true});
        this.forest = new Howl({src: ['sound/forest.mp3'], loop: true, volume: 2});
        this.bg = new Howl({src: ['sound/Goldberg.mp3'], loop: true, volume: 0.5});
        this.door = new Howl({src: ['sound/door.mp3']});
        this.pickPants = new Howl({src: ['sound/pickPants.mp3']})
        this.pants = new Howl({src: ['sound/pants.mp3']});
        this.drip = new Howl({src: ['sound/drip.mp3']});
        this.knock = new Howl({src: ['sound/knock.mp3']});
        this.clicks = new Howl({
            src: ['sound/clicks.mp3'],
            sprite: {
                s0: [0, 200],
                s1: [200, 200],
                s2: [400, 200],
                s3: [600, 200],
                s4: [800, 200],
                s5: [1000, 200],

            }
        });

        this.wooshes = new Howl({
            src: ['sound/wooshes.mp3'],
            sprite: {
                s0: [0, 500],
                s1: [500, 500],
                s2: [1000, 500],
                s3: [1500, 500],
                s4: [2000, 500],
                s5: [2500, 500],
                s6: [3000, 500],

            }
        });


        // this.sound.load()
        this.stepInside = new Howl({
            src: ['sound/footstep_wood.mp3'],
            sprite: {
                step0: [0, 500],
                step1: [500, 500],
                step2: [1000, 500],
                step3: [1500, 500],
                step4: [2000, 500],
                step5: [2500, 500],
                step6: [3000, 500],
                step7: [3500, 500],
                step8: [4000, 500],
                step9: [4500, 500],
                step10: [5000, 500],
                step11: [5500, 500],
                step12: [6000, 500],
                step13: [6500, 500],
                step14: [7000, 500],
            }
        });
        this.stepInside.volume(0.1)
        this.stepOutside = new Howl({
            src: ['sound/footstep_gravel.mp3'],
            sprite: {
                step0: [0, 500],
                step1: [500, 500],
                step2: [1000, 500],
                step3: [1500, 500],
                step4: [2000, 500],
                step5: [2500, 500],
                step6: [3000, 500],
                step7: [3500, 500],
                step8: [4000, 500],
                step9: [4500, 500],
                step10: [5000, 500],
                step11: [5500, 500],
                step12: [6000, 500],
                step13: [6500, 500],

            }
        });
        this.stepOutside.volume(0.5)

    }

    startMusic() {
        this.bg.volume(0.5)
        this.bg.play();
    }

    onUI() {
        /*  UI.pushWindow("Sound")
          if(UI.LButton("test")){

              let s =Math.floor( Math.random()*1000)%15;
              this.stepInside.play("step" + s)
              console.log("step"+s)
          }
          UI.popWindow()*/
    }

    playPants() {
        this.pants.volume(this.fxVolume);
        this.pants.play();
    }

    playForest() {
        if (GameModel.dayNight == 1) return;
        this.forest.play();
        this.forest.fade(0, 1, 1000)
    }

    stopForest() {
        this.forest.stop()
    }

    playDoor() {
        this.door.play()
        this.door.volume(this.fxVolume)
    }

    playWoosh(volMult: number = 1) {


        let s = Math.floor(Math.random() * 1000) % 7;
        this.wooshes.volume(volMult * 0.2 * this.fxVolume);
        this.wooshes.play("s" + s)


    }

    playClick(volMult: number = 1) {


        let s = Math.floor(Math.random() * 1000) % 6;

        this.clicks.volume(volMult * this.fxVolume);
        this.clicks.play("s" + s)

    }

    playFootstep() {

        let pos = GameModel.characterPos.clone()
        let p = GameModel.gameCamera.getScreenPos(pos)

        if (GameModel.currentScene == Scenes.ROOM) {
            let s = Math.floor(Math.random() * 1000) % 15;

            this.stepInside.pos(pos.x, pos.y, pos.z)
            this.stepInside.play("step" + s)
            this.stepInside.volume(0.1 * this.fxVolume)
        } else {
            let s = Math.floor(Math.random() * 1000) % 14;
            this.stepOutside.pos(pos.x, pos.y, pos.z)
            this.stepOutside.play("step" + s)
            this.stepOutside.volume(0.5 * this.fxVolume)
        }
    }

    setMusicVolume(value: number) {
        this.bg.volume(0.5 * value)

    }

    setFXVolume(value: number) {
        this.forest.volume(2 * value)
        this.fxVolume = value;
    }

    playPickPants() {
        this.pickPants.volume(this.fxVolume)
        this.pickPants.play()
    }

    playDrip() {
        this.drip.volume(this.fxVolume * 0.5)
        this.drip.play()
    }

    playFishFood() {
        this.fishFood.volume(this.fxVolume * 0.2)
        this.fishFood.play()
    }

    playShovel() {
        this.shovel.volume(this.fxVolume * 0.4)
        this.shovel.play()
    }

    playKnock() {
        this.knock.volume(this.fxVolume * 0.4)
        this.knock.play()
    }

    startTyping() {
        this.typing.volume(this.fxVolume * 0.2)
        this.typing.play()
    }

    stopTyping() {

        this.typing.stop()
    }
}

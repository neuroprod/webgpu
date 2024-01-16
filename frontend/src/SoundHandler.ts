import PreLoader from "./lib/PreLoader";
import {Howl} from 'howler';

import GameModel, {Scenes} from "./GameModel";

export default class SoundHandler {
    private stepInside: Howl;
    private stepOutside: Howl;
    private bg: Howl;
    private door: Howl;
    private forest: Howl;
    private button: Howl;

    constructor(preloader: PreLoader) {
        this.button  = new Howl({src: ['sound/button.mp3'],volume:0.2});
        this.forest  = new Howl({src: ['sound/forest.mp3'],volume:2});
        this.bg = new Howl({src: ['sound/Goldberg.mp3'], autoplay: true,loop:true, volume: 0.5});
        this.door = new Howl({src: ['sound/door.mp3']});
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

    onUI() {
        /*  UI.pushWindow("Sound")
          if(UI.LButton("test")){

              let s =Math.floor( Math.random()*1000)%15;
              this.stepInside.play("step" + s)
              console.log("step"+s)
          }
          UI.popWindow()*/
    }
    playButton() {

        this.button.play()
    }
    playForest() {
        this.forest.play();
        this.forest.fade(0,1,1000)
    }
    stopForest() {
        this.forest.stop()
    }
    playDoor() {
        this.door.play()
    }

    playFootstep() {

        let pos = GameModel.characterPos.clone()
        let p =GameModel.gameCamera.getScreenPos( pos)

        if (GameModel.currentScene == Scenes.ROOM) {
            let s = Math.floor(Math.random() * 1000) % 15;

            this.stepInside.pos(pos.x,pos.y,pos.z)
            this.stepInside.play("step" + s)
        } else {
            let s = Math.floor(Math.random() * 1000) % 14;
            this.stepOutside.pos(pos.x,pos.y,pos.z)
            this.stepOutside.play("step" + s)
        }
    }
}
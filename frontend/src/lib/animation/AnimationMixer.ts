
import Animation from "./Animation";
import UI from "../UI/UI";
import Texture from "../textures/Texture";
import GameModel from "../../GameModel";
export default class AnimationMixer{
    private animations: Array<Animation>;
    private animationsByName: { [name: string]: Animation } = {};
    public mixValue: number=1;

    private anime1:Animation;
    private anime2:Animation;
    private currentAnimation: Animation;
    constructor() {

    }
    setAnimations(animations:Array<Animation>){
        this.animations =animations;

        for(let a of this.animations){
            this.animationsByName[a.label] =a;

        }
        this.animationsByName["holding"].setAsMixAnimation(["RightArm","RightFore","RightHand"])


        this.anime1 =this.animationsByName["idle"]
        this.anime2 =this.animationsByName["idle"]
        this.anime2.speedMultiplier =0.8;
     let walking =this.animationsByName["walking"];
        walking.setCallBack(31*(1/30),()=>{GameModel.sound.playFootstep()})
        walking.setCallBack(11*(1/30),()=>{GameModel.sound.playFootstep()})
    }
    addAnimations(animations: Array<Animation>) {
        for(let a of animations){
            this.animationsByName[a.label] =a;
            this.animations.push(a)
        }
    }



    onUI(){
       UI.pushWindow("Animation")
        for(let a of this.animations){

            if(!a.isMixAnimation) {
                if (UI.LButton(a.label)) {
                    this.setAnimation(a.label);
                    this.mixValue = 1;
                }
            }
        }
        for(let a of this.animations){

            if(a.isMixAnimation) {
                a.mixValue =  UI.LFloatSlider(a.label,a.mixValue,0,1);

            }
        }
        UI.popWindow()
    }
    update(){


        if(this.mixValue<0.01){
            this.anime1.update()

            this.currentAnimation = this.anime1;

        } else if(this.mixValue>0.99){
            this.anime2.update()
            this.currentAnimation = this.anime2;


        }else{
            this.anime1.update()
            this.anime2.update()

            for(let i=0;i<  this.anime1.channels.length;i++)
            {
               if(  this.anime1.channels[i].target !=   this.anime2.channels[i].target){
                   console.log("fail");
               }

                this. anime1.channels[i].mix(  this.anime2.channels[i].result,this.mixValue)


            }
            this.currentAnimation =this.anime1;


        }
        for(let mix of this.animations) {

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

    setAnimation(name: string,startTime =0) {
        this.anime1 =  this.anime2
       this.anime2 =this.animationsByName[name]
        this.anime2.setStartValue()
        this.anime2.time=0;
        this.mixValue =0;
       // this.animation2 = this.getAnimationIndexByName()

    }


}

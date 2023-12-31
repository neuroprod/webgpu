
import Animation from "./Animation";
import UI from "../UI/UI";
import Texture from "../textures/Texture";
export default class AnimationMixer{
    private animations: Array<Animation>;
    private animationsByName: { [name: string]: Animation } = {};
    public mixValue: number=1;

    private anime1:Animation;
    private anime2:Animation;
    constructor() {

    }
    setAnimations(animations:Array<Animation>){
        this.animations =animations;
        for(let a of this.animations){
            this.animationsByName[a.label] =a;

        }
        this.anime1 =this.animationsByName["idle"]
        this.anime2 =this.animationsByName["idle"]

    }
    onUI(){
        //UI.pushWindow("Animation")
     //  this.mixValue =UI.LFloatSlider("mix",this.mixValue,0,1);
       // UI.popWindow()
    }
    update(){


        if(this.mixValue<0.01){
            this.anime1.update()

            this.anime1.set();

        } else if(this.mixValue>0.99){
            this.anime2.update()
            this.anime2.set();

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

            this.anime1.set();

        }

    }

    setAnimation(name: string,startTime =0) {
        this.anime1 =  this.anime2
       this.anime2 =this.animationsByName[name]
        this.anime2.time=0;
        this.mixValue =0;
       // this.animation2 = this.getAnimationIndexByName()

    }
}


import Animation from "./Animation";
import UI from "../UI/UI";
export default class AnimationMixer{
    private animations: Array<Animation>;
    private mixValue: number=0;
    private animation1:number=0;
    private animation2:number =1;
    constructor() {

    }
    setAnimations(animations:Array<Animation>){
        this.animations =animations;
    }
    onUI(){
        UI.pushWindow("Animation")
       //this.mixValue =UI.LFloatSlider("mix",this.mixValue,0,1);
        UI.popWindow()
    }
    update(){
        let anime1 = this.animations[this.animation1]
        let anime2 = this.animations[this.animation2]

        if(this.mixValue<0.01){
            anime1.update()

            anime1.set();

        } else if(this.mixValue>0.99){
            anime2.update()
            anime2.set();

        }else{
            anime1.update()
            anime2.update()

        }

    }
}

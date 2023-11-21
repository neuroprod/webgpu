import RenderPass from "./lib/core/RenderPass";
import UI from "./lib/UI/UI";

class RenderSettings{
    private passes:Array<RenderPass>=[];
    public bloom_threshold: number=1;
    public bloom_softThreshold:number=0.2;


    public exposure=1;
    public contrast =1;
    public brightness:number =0;
    public vibrance:number=0;
    public saturation:number =0
    public vin_amount: number =0.5;
    public vin_falloff: number=0.4;
    public bloom_strength: number =1;



    constructor() {

    }
    registerPass(pass:RenderPass){
        this.passes.push(pass);
    }
   onChange()
   {
       for(let p of this.passes)
       {
           p.onSettingsChange()
       }

   }
   onUI(){
        UI.pushGroup("Bloom");
       this.bloom_threshold =UI.LFloatSlider("Threshold",this.bloom_threshold,0,20)
       this.bloom_softThreshold =UI.LFloatSlider("SoftThreshold",this.bloom_softThreshold,0,1)
       this.bloom_strength =UI.LFloatSlider("Strength", this.bloom_strength,0,5)
       UI.popGroup()

       UI.pushGroup("Post");
       this.exposure=UI.LFloatSlider("Exposure",this.exposure,0,10);
       this.brightness=UI.LFloatSlider("Brightness",this.brightness,-1,1);
       this.contrast=UI.LFloatSlider("Contrast",this.contrast,0,2);

       this.vibrance=UI.LFloatSlider("Vibrance",this.vibrance,-1,1);
       this.saturation=UI.LFloatSlider("Saturation",this.saturation,-1,1);

       UI.separator("Vignette");
       this.vin_amount=UI.LFloatSlider("Amount",this.vin_amount,0,1);
       this.vin_falloff=UI.LFloatSlider("Falloff",this.vin_falloff,0,1);







       UI.popGroup()
        this.onChange();

    }

}
export default new RenderSettings()

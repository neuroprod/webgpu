import RenderPass from "./lib/core/RenderPass";
import UI from "./lib/UI/UI";
import {Vector4} from "math.gl";

class RenderSettings{
    private passes:Array<RenderPass>=[];
    public bloom_threshold: number=2;
    public bloom_softThreshold:number=1;
    public bloom_strength: number =0.2;

    public exposure=1;
    public contrast =1;
    public brightness:number =0;
    public vibrance:number=0;
    public saturation:number =0
    public vin_amount: number =0.52;
    public vin_falloff: number=0.52;


    public ref_settings1:Vector4 =new Vector4(1,0,0.01,1.4);
    public ref_settings2:Vector4=new Vector4(20,10,1,1);

    public dof_Settings:Vector4=new Vector4(0.47,0.8,3,1.5);

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
       UI.pushGroup("Reflection");
       this.ref_settings1.x =UI.LFloatSlider("Strength",this.ref_settings1.x,0,20) ;
       this.ref_settings1.y =UI.LFloatSlider("Metal Boost",this.ref_settings1.y,0,20) ;
       this.ref_settings1.z =UI.LFloatSlider("Step Size",this.ref_settings1.z,0,0.5) ;
       this.ref_settings1.w =UI.LFloatSlider("Step Mult",this.ref_settings1.w,1,2) ;

       this.ref_settings2.x =UI.LFloatSlider("Num Steps",this.ref_settings2.x,0,20) ;
       this.ref_settings2.y =UI.LFloatSlider("Num StepsTune",this.ref_settings2.y,0,20) ;
       this.ref_settings2.z =UI.LFloatSlider("MaxDistScale",this.ref_settings2.z,0,20) ;
       this.ref_settings2.w =UI.LBool("debugColors",false)?1:0 ;
       UI.popGroup()
       UI.pushGroup("Dof");
       this.dof_Settings.z =UI.LFloatSlider("Samples",   this.dof_Settings.z ,0,10) ;
       this.dof_Settings.w =UI.LFloatSlider("Step",   this.dof_Settings.w ,0,10) ;
       this.dof_Settings.x =UI.LFloatSlider("Min",   this.dof_Settings.x ,0,1) ;
       this.dof_Settings.y =UI.LFloatSlider("Max",   this.dof_Settings.y ,0,1) ;
       UI.popGroup()
       UI.pushGroup("Post");

       this.exposure=UI.LFloatSlider(this ,"exposure",0,10);
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

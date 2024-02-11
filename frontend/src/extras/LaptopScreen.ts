import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import Plane from "../lib/meshes/Plane";
import LaptopTrianagleShader from "./LaptopTrianagleShader";
import Timer from "../lib/Timer";
import LaptopShader from "./LaptopShader";

import LaptopMailShader from "./LaptopMailShader";
import LaptopProgrammingShader from "./LaptopProgrammingShader";
import {StateFasion} from "../GameModel";
import LaptopCanMakeShader from "./LaptopCanMakeShader";

export class LaptopScreen extends Model{
    private triangleMaterial: Material;

    private emailMaterialLaptop: Material;
    private imageMaterial: Material;
    private programMaterial: Material;
    private canMakeMaterial: Material;

    constructor(renderer,parent:Model) {
        super(renderer,"laptopScreen");
        this.mesh = new Plane(renderer);


        this.emailMaterialLaptop =new Material(this.renderer,"imgLaptopMaterial", new LaptopMailShader(this.renderer,"laptopShader"))
        this.emailMaterialLaptop.uniforms.setTexture("image",renderer.texturesByLabel["LT_email.png"])
        this.emailMaterialLaptop.uniforms.setUniform("ratio",8/5);
        this.material = this.emailMaterialLaptop;

        this.imageMaterial  =new Material(this.renderer,"imgLaptopMaterial", new LaptopShader(this.renderer,"laptopShader"))
        this.imageMaterial.uniforms.setUniform("ratio",8/5);


        this.canMakeMaterial  =new Material(this.renderer,"canMakeMaterial", new LaptopCanMakeShader(this.renderer,"laptopShadercanmake"))
        this.canMakeMaterial.uniforms.setUniform("ratio",8/5);
        this.canMakeMaterial.uniforms.setTexture("image",this.renderer.texturesByLabel["LT_wait.png"])

        this.triangleMaterial  =    new Material(this.renderer,this.label,new LaptopTrianagleShader(this.renderer,this.label));
        this.triangleMaterial.uniforms.setUniform("ratio",8/5);
        this.triangleMaterial.uniforms.setTexture("triangle",renderer.texturesByLabel["LT_triangle.png"])


        this.programMaterial  =new Material(this.renderer,"laptopPrgMaterial", new LaptopProgrammingShader(this.renderer,"laptopProgShader"))
        this.programMaterial.uniforms.setTexture("image",renderer.texturesByLabel["LT_programming.png"])
        this.programMaterial.uniforms.setUniform("ratio",8/5);



        this.setPosition(0.01,0,0.05)
        this.setScale(0.8,1,0.5)
        this.setEuler(Math.PI/2,0,0)
        parent.addChild(this)

        parent.hitFriends.push(this);
    }
    update() {
        this.material.uniforms.setUniform("time",Timer.time);
        super.update();
    }

    setState(state: StateFasion) {
        if(state ==StateFasion.START || state ==StateFasion.CAN_READ_MAIL_MAILBOX){
            this.material = this.emailMaterialLaptop;

        }
        else if(state ==StateFasion.READ_MAIL ){
            this.material = this.imageMaterial;
            this.imageMaterial.uniforms.setTexture("image",this.renderer.texturesByLabel["LT_readMail1.png"])

        } else if(state ==StateFasion.READ_MAIL_MAILBOX ){
            this.material = this.imageMaterial;
            this.imageMaterial.uniforms.setTexture("image",this.renderer.texturesByLabel["LT_readMail2.png"])

        } else if(state ==StateFasion.CAN_MAKE_TRIANGLE || state ==StateFasion.CAN_FINISH_WEBSITE ){
            this.material = this.canMakeMaterial;


        } else if(state ==StateFasion.MAKE_TRIANGLE_DONE){
            this.material = this.triangleMaterial


        }else if(state ==StateFasion.MAKE_TRIANGLE|| state ==StateFasion.FINISH_WEBSITE  ){
            this.material =  this.programMaterial;
        }
        else if(state ==StateFasion.FINISH_WEBSITE_DONE){
            this.material = this.imageMaterial;
            this.imageMaterial.uniforms.setTexture("image",this.renderer.texturesByLabel["LT_pantsTemp.png"])
        }


    }
}

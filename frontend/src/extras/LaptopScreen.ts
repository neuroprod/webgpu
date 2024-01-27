import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import Plane from "../lib/meshes/Plane";
import LaptopTrianagleShader from "./LaptopTrianagleShader";
import Timer from "../lib/Timer";
import LaptopShader from "./LaptopShader";
import {LaptopState} from "../GameModel";

export class LaptopScreen extends Model{
    private triangleMaterial: Material;
    private imgMaterial: Material;

    constructor(renderer,parent:Model) {
        super(renderer,"laptopScreen");
        this.mesh = new Plane(renderer);


        this.imgMaterial =new Material(this.renderer,"imgLaptopMaterial", new LaptopShader(this.renderer,"laptopShader"))
        this.imgMaterial.uniforms.setTexture("image",renderer.texturesByLabel["laptopEmail.png"])
        this.imgMaterial.uniforms.setUniform("ratio",8/5);
        this.material =this.imgMaterial;

        this.triangleMaterial  =    new Material(this.renderer,this.label,new LaptopTrianagleShader(this.renderer,this.label));
        this.triangleMaterial.uniforms.setUniform("ratio",8/5);
        this.triangleMaterial.uniforms.setTexture("triangle",renderer.texturesByLabel["triangle.png"])
        this.triangleMaterial.uniforms.setTexture("text",renderer.texturesByLabel["text_s.png"])




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

    setState(state: LaptopState) {
        if(state ==LaptopState.NONE){
            this.material =  this.imgMaterial;
            this.material.uniforms.setTexture("image",this.renderer.texturesByLabel["laptopText.png"])
        }
        if(state ==LaptopState.MAIL){
            this.material =  this.imgMaterial;
            this.material.uniforms.setTexture("image",this.renderer.texturesByLabel["laptopEmail.png"])
        }
        if(state ==LaptopState.TRIANGLE){
            this.material =    this.triangleMaterial ;

        }
    }
}

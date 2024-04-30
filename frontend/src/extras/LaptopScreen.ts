import Model from "../lib/model/Model";
import Material from "../lib/core/Material";
import Plane from "../lib/meshes/Plane";

import Timer from "../lib/Timer";
import LaptopShader from "./LaptopShader";

import LaptopMailShader from "./LaptopMailShader";
import LaptopProgrammingShader from "./LaptopProgrammingShader";
import {StateFasion} from "../../public/GameModel";
import LaptopCanMakeShader from "./LaptopCanMakeShader";
import LaptopDistordShader from "./LaptopDistordShader";
import Noise1D from "./Noise1D";

import {Vector2} from "math.gl";

export class LaptopScreen extends Model {


    private emailMaterialLaptop: Material;
    private imageMaterial: Material;
    private programMaterial: Material;
    private canMakeMaterial: Material;
    private imageDistordMaterial: Material;
    private state: StateFasion;
    private noise1D = new Noise1D()

    constructor(renderer, parent: Model) {
        super(renderer, "laptopScreen");
        this.mesh = new Plane(renderer);


        this.emailMaterialLaptop = new Material(this.renderer, "imgLaptopMaterial", new LaptopMailShader(this.renderer, "laptopShader"))
        this.emailMaterialLaptop.uniforms.setTexture("image", renderer.texturesByLabel["LT_email.png"])
        this.emailMaterialLaptop.uniforms.setUniform("ratio", 8 / 5);
        this.material = this.emailMaterialLaptop;

        this.imageMaterial = new Material(this.renderer, "imgLaptopMaterial", new LaptopShader(this.renderer, "laptopShader"))
        this.imageMaterial.uniforms.setUniform("ratio", 8 / 5);


        this.imageDistordMaterial = new Material(this.renderer, "imgLaptopMaterial", new LaptopDistordShader(this.renderer, "laptopDistordShader"))
        this.imageDistordMaterial.uniforms.setUniform("ratio", 8 / 5);


        this.canMakeMaterial = new Material(this.renderer, "canMakeMaterial", new LaptopCanMakeShader(this.renderer, "laptopShadercanmake"))
        this.canMakeMaterial.uniforms.setUniform("ratio", 8 / 5);
        this.canMakeMaterial.uniforms.setTexture("image", this.renderer.texturesByLabel["LT_wait.png"])


        this.programMaterial = new Material(this.renderer, "laptopPrgMaterial", new LaptopProgrammingShader(this.renderer, "laptopProgShader"))
        this.programMaterial.uniforms.setTexture("image", renderer.texturesByLabel["LT_programming.png"])
        this.programMaterial.uniforms.setUniform("ratio", 8 / 5);


        this.setPosition(0.01, 0, 0.05)
        this.setScale(0.8, 1, 0.5)
        this.setEuler(Math.PI / 2, 0, 0)
        parent.addChild(this)

        parent.hitFriends.push(this);
    }

    update() {
        this.material.uniforms.setUniform("time", Timer.time / 2);

        if (this.state == StateFasion.FINISH_WEBSITE_DONE) {
            let n = this.noise1D.noise1d(Timer.time * 2) + 1;
            n *= 0.4;
            this.imageDistordMaterial.uniforms.setUniform("offset", n)
            this.imageDistordMaterial.uniforms.setUniform("offsetBuy", new Vector2(Math.random() * 2 - 0.5, Math.random() * 2 - 0.5))
        }

        super.update();
    }

    setState(state: StateFasion) {
        this.state = state;
        if (state == StateFasion.START || state == StateFasion.CAN_READ_MAIL_MAILBOX) {
            this.material = this.emailMaterialLaptop;

        } else if (state == StateFasion.READ_MAIL) {
            this.material = this.imageMaterial;
            this.imageMaterial.uniforms.setTexture("image", this.renderer.texturesByLabel["LT_readMail1.png"])

        } else if (state == StateFasion.READ_MAIL_MAILBOX) {
            this.material = this.imageMaterial;
            this.imageMaterial.uniforms.setTexture("image", this.renderer.texturesByLabel["LT_readMail2.png"])

        } else if (state == StateFasion.CAN_MAKE_TRIANGLE) {
            this.material = this.canMakeMaterial;


        } else if (state == StateFasion.MAKE_TRIANGLE) {
            this.material = this.programMaterial;
        } else if (state == StateFasion.FINISH_WEBSITE_DONE) {
            this.material = this.imageDistordMaterial;
            this.imageDistordMaterial.uniforms.setTexture("image", this.renderer.texturesByLabel["LT_pantsTemp.png"])
        }


    }
}

import gsap from "gsap"
import Model from "../lib/model/Model";
import GameModel, {MillState} from "../../public/GameModel";
import Renderer from "../lib/Renderer";

import Material from "../lib/core/Material";
import MillSparkShader from "./MillSparkShader";
import Timer from "../lib/Timer";
import Plane from "../lib/meshes/Plane";
import MillPanelShader from "./MillPanelShader";


export default class Mill {
    private millBed: Model;
    private millHead: Model;
    private millControle: Model;
    private headPos: number = 0.1;
    private tl: gsap.core.Timeline;
    private bedZ: number = -0.2;
    public sparkModel: Model;
    private renderer: Renderer;
    private mill: Model;
    millControlePanel: Model;
    private millCount = 0;

    constructor(mill: Model, renderer: Renderer) {
        this.renderer = renderer;
        this.mill = mill;
        this.millBed = mill.children[0] as Model;
        this.millHead = mill.children[2] as Model;
        this.millControle = mill.children[1] as Model;

        let sm = renderer.modelByLabel["spark"];
        sm.visible = false;

        this.sparkModel = new Model(renderer, "spark");
        this.sparkModel.mesh = sm.mesh;
        this.sparkModel.material = new Material(renderer, "sparkMaterial", new MillSparkShader(renderer, "MillSparkShader"))
        this.sparkModel.material.depthWrite = false
        this.sparkModel.numInstances = 30;
        this.sparkModel.setPosition(0, 0.16, 0)
        this.sparkModel.setScale(0.5, 0.5, 0.5)
        this.makeSparkBuffer()
        this.sparkModel.visible = false

        //this.sparkModel.addBuffer("pos")
        mill.addChild(this.sparkModel);


        this.millControlePanel = new Model(renderer, "millControlePanel");
        this.millControlePanel.mesh = new Plane(renderer);
        this.millControlePanel.material = new Material(renderer, "millControlePanel", new MillPanelShader(renderer, "MillPanelShader"))
        this.millControlePanel.setScaler(0.18)
        this.millControlePanel.setPosition(0.06, -0.02, -0.05)
        this.millControlePanel.material.uniforms.setUniform("time", this.millCount)
        this.millControlePanel.setEuler(0, 0, 0);
        this.millControlePanel.visible = false
        this.millControle.addChild(this.millControlePanel)

        this.setState(0)
        return;


    }

    private makeSparkBuffer() {
        let data = new Float32Array(this.sparkModel.numInstances * 4)
        let index = 0;
        for (let i = 0; i < this.sparkModel.numInstances; i++) {


            data[index++] = Math.pow(Math.random(), 2.0) * 0.3;
            data[index++] = Math.random() * Math.PI / 2;
            data[index++] = Math.random() * Math.PI * 2;
            data[index++] = Math.random() + 0.5;

        }


        let buffer = this.renderer.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(buffer.getMappedRange());
        dst.set(data);

        buffer.unmap();
        buffer.label = "instanceBuffer_" + "";
        this.sparkModel.addBuffer("instanceData", buffer)

    }

    update() {
        //this.millControlePanel.setPositionV(GameModel.temp1)
        //this.millControlePanel.setScaler(GameModel.temp2.x)
        this.millHead.setPosition(0, this.headPos, 0)
        this.millBed.setPosition(0, 0, this.bedZ)
    }

    setState(state: MillState) {
        if (state == MillState.OFF) {
            if (this.tl) this.tl.clear()
            this.headPos = 0.1;
            this.bedZ = -0.2;
            this.millBed.enableHitTest = true;
            this.millHead.enableHitTest = true;
            this.millControle.enableHitTest = true;
            this.mill.enableHitTest = true;
            GameModel.renderer.modelByLabel["keyStock"].visible = true;
            GameModel.renderer.modelByLabel["key"].visible = false
            GameModel.renderer.modelByLabel["key"].enableHitTest = false;
            if (GameModel.pointLightsByLabel["millLight"]) GameModel.pointLightsByLabel["millLight"].setStrength(0)
            this.sparkModel.visible = false
            this.millControlePanel.visible = false

        } else if (state == MillState.ON) {
            GameModel.renderer.modelByLabel["keyStock"].visible = true;
            GameModel.renderer.modelByLabel["key"].visible = false
            GameModel.renderer.modelByLabel["key"].enableHitTest = false;
            if (this.tl) this.tl.clear()
            this.headPos = 0.1;
            this.bedZ = -0.2;
            this.tl = gsap.timeline({repeat: -1, repeatDelay: 1,});
            this.tl.timeScale(3);

            this.tl.call(() => {
                this.updateText()
            }, [])
            this.tl.to(this, {"headPos": 0.03, ease: "sine.inOut"})
            this.tl.call(() => {
                this.updateText()
            }, [])
            this.tl.to(this, {
                "bedZ": 0.2, duration: 4, ease: "sine.inOut", onUpdate: () => {
                    this.millCut()
                }
            }, ">")
            this.tl.call(() => {
                this.updateText()
            }, [])
            this.tl.to(this, {"headPos": 0.1, ease: "sine.inOut"}, ">")
            this.tl.call(() => {
                this.updateText()
            }, [])
            this.tl.to(this, {"bedZ": -0.2, duration: 2, ease: "sine.inOut"}, "<")
            this.millControlePanel.visible = true

        } else if (state == MillState.DONE) {
            if (this.tl) this.tl.clear()
            this.tl = gsap.timeline({});


            this.tl.to(this, {"headPos": 0.3, ease: "sine.inOut"}, 0);
            this.tl.to(this, {"bedZ": 0.0, ease: "sine.inOut"}, 0);

            this.sparkModel.visible = false

            GameModel.renderer.modelByLabel["keyStock"].visible = false;

            this.millBed.enableHitTest = false;
            this.millHead.enableHitTest = false;
            this.millControle.enableHitTest = false;
            this.mill.enableHitTest = false;

            GameModel.renderer.modelByLabel["key"].visible = true;
            GameModel.renderer.modelByLabel["key"].enableHitTest = true;
            GameModel.pointLightsByLabel["millLight"].setStrength(0)
            this.sparkModel.visible = false
            this.millControlePanel.visible = true
        }
    }

    updateText() {
        this.millCount++;
        this.millControlePanel.material.uniforms.setUniform("time", this.millCount)
    }

    public millCut() {

        if (this.bedZ < 0.15 && this.bedZ > -0.17) {
            if (Timer.frame % 2 == 0) {
                GameModel.pointLightsByLabel["millLight"].setStrength(0)
            } else {
                GameModel.pointLightsByLabel["millLight"].setStrength(Math.pow(Math.random(), 2.0));
            }
            // GameModel.pointLightsByLabel[ "millLight"].setStrength(Math.pow(Math.random(),2.0));
            this.sparkModel.visible = true
            this.sparkModel.setEuler(0, Math.random() * 100, 0);
        } else {
            this.sparkModel.visible = false;
            GameModel.pointLightsByLabel["millLight"].setStrength(0)
        }

    }
}

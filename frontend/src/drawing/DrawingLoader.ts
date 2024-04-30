import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import Drawing from "./Drawing";

export default class DrawingLoader extends Drawing {


    constructor(renderer: Renderer, preLoader: PreLoader, url) {

        super(renderer, url, 0)


        preLoader.startLoad();
        this.loadURL(url).then(() => {
            preLoader.stopLoad();
        });


    }

    async loadURL(url: any) {

        const responseBuffer = await fetch(url)

        let dataBuffer = await responseBuffer.arrayBuffer();
        let data = new Int16Array(dataBuffer)
        this.sceneID = data[0];

        this.offset.x = data[1] / 1000;
        this.offset.y = data[2] / 1000;
        this.offset.z = data[3] / 1000;

        this.color.x = data[4] / 255;
        this.color.y = data[5] / 255;
        this.color.z = data[6] / 255;
        this.material.uniforms.setUniform("color", this.color)

        let size = (data.length - 16) / 3;

        let bufferData = new Float32Array(size * 4)
        let inputPos = 16;
        let outputPos = 0;
        for (let i = 0; i < size; i++) {

            bufferData[outputPos++] = data[inputPos++] / 1000;
            bufferData[outputPos++] = data[inputPos++] / 1000;
            bufferData[outputPos++] = data[inputPos++] / 1000;
            bufferData[outputPos++] = 0;
        }
        this.numInstances = size
        this.numDrawInstances = size
        this.numDrawInstancesMax = size;
        this.createBuffer(bufferData, "instanceBuffer")
    }


}

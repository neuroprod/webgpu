import Renderer from "../Renderer";
import PreLoader from "../PreLoader";
import TextureLoader from "../textures/TextureLoader";
import Mesh from "../core/Mesh";
import {Vector2} from "math.gl";


class Char {
    w: number;
    h: number;
    uvSize: Vector2;
    uvPos: Vector2;
    xadvance: number;
    xOffset: number;
    yOffset: number;

    constructor(data: any) {

        this.w = data.width / 300;
        this.h = data.height / 300;
        this.xadvance = data.xadvance / 300;
        this.xOffset = data.xoffset / 300;
        this.yOffset = data.yoffset / 300;


        this.uvSize = new Vector2(data.width / 512, data.height / 512)
        this.uvPos = new Vector2(data.x / 512, data.y / 512)


    }

}

export default class Font {
    private json: any;
    private renderer: Renderer;
    private charArray: Array<Char> = new Array<Char>(200);

    constructor(renderer: Renderer, preLoader: PreLoader) {

        this.renderer = renderer;
        preLoader.startLoad();
        new TextureLoader(renderer, preLoader, "Font.png", {});

        this.loadURL("Font").then(() => {
            preLoader.stopLoad();
        });

    }

    async loadURL(url: any) {


        const response = await fetch(url + "-msdf.json")
        let text = await response.text()
        this.json = JSON.parse(text)

        this.parseChars();

    }

    getMesh(text: string) {


        let lines = text.split("\n");
        let textLength = 0;
        for (let l of lines) {
            textLength += l.length;

        }

        let vertices = new Float32Array(textLength * 4 * 3)
        let uv = new Float32Array(textLength * 4 * 2)
        let indices = new Uint16Array(textLength * 2 * 3)
        let verticesCount = 0;
        let uvCount = 0;
        let indicesCount = 0;
        let indicesPos =0;
        let yPos =0;
        for (let l of lines) {
            let lineLength = l.length;
            let lineSize=0

            for (let i = 0; i < lineLength; i++) {
                let c = l.charCodeAt(i);
                let char = this.charArray[c];
                lineSize+=char.xadvance
            }


            let xPos = -lineSize/2 ;
            for (let i = 0; i < lineLength; i++) {
                let c = l.charCodeAt(i);

                let char = this.charArray[c];
                let offX = char.xOffset;
                let offY = char.yOffset;

                vertices[verticesCount++] = xPos + offX;
                vertices[verticesCount++] = -offY+yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x;
                uv[uvCount++] = char.uvPos.y;

                vertices[verticesCount++] = char.w + xPos + offX;
                vertices[verticesCount++] = -offY+yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x + char.uvSize.x;
                uv[uvCount++] = char.uvPos.y;


                vertices[verticesCount++] = xPos + offX;
                vertices[verticesCount++] = -char.h - offY+yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x;
                uv[uvCount++] = char.uvPos.y + char.uvSize.y;

                vertices[verticesCount++] = char.w + xPos + offX;
                vertices[verticesCount++] = -char.h - offY+yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x + char.uvSize.x;
                uv[uvCount++] = char.uvPos.y + char.uvSize.y;




                indices[indicesCount++] = indicesPos;
                indices[indicesCount++] = 2 + indicesPos;
                indices[indicesCount++] = 1 + indicesPos;


                indices[indicesCount++] = 3 + indicesPos;
                indices[indicesCount++] = 1 + indicesPos;

                indices[indicesCount++] = 2 + indicesPos;
                indicesPos+=4;
                xPos += char.xadvance;
            }
            yPos-=42/300;
        }

        let m = new Mesh(this.renderer, "text");


        m.setUV0(uv)
        m.setVertices(vertices)
        m.setIndices(indices)

        return m;
    }


    private parseChars() {
        for (let data of this.json.chars) {
            this.charArray[data.id] = new Char(data)

        }
    }
}

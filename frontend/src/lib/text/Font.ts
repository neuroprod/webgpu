import Renderer from "../Renderer";
import PreLoader from "../PreLoader";
import TextureLoader from "../textures/TextureLoader";
import Mesh from "../core/Mesh";
import {Vector2} from "math.gl";

//https://www.npmjs.com/package/msdf-bmfont-xml

class Char {
    w: number = 0;
    h: number = 0;
    uvSize: Vector2 = new Vector2();
    uvPos: Vector2 = new Vector2();
    xadvance: number = 0;
    xOffset: number = 0;
    yOffset: number = 0;

    constructor(data: any) {
        if (!data) return;
        this.w = data.width / 300;
        this.h = data.height / 300;
        this.xadvance = data.xadvance / 300;
        this.xOffset = data.xoffset / 300;
        this.yOffset = data.yoffset / 300;


        this.uvSize = new Vector2(data.width / 512, data.height / 512)
        this.uvPos = new Vector2(data.x / 512, data.y / 512)


    }

}

export enum TEXT_ALIGN {
    LEFT,
    CENTER,
    RIGHT,
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

    getMesh(text: string, align: TEXT_ALIGN = TEXT_ALIGN.LEFT, spacing: number = 0) {

        spacing *= 0.01;
        let lines = text.split("\n");
        let textLength = 0;
        for (let l of lines) {
            textLength += l.length;

        }

        let vertices = new Float32Array(textLength * 4 * 3)
        let uv = new Float32Array(textLength * 4 * 4)
        let indices = new Uint16Array(textLength * 2 * 3)
        let verticesCount = 0;
        let uvCount = 0;
        let indicesCount = 0;
        let indicesPos = 0;
        let yPos = 0;
        let isBold = 0;
        for (let l of lines) {
            let lineLength = l.length;
            let lineSize = 0

            for (let i = 0; i < lineLength; i++) {
                let c = l.charCodeAt(i);
                if (c == 42) {
                    continue
                }
                let char = this.charArray[c];

                lineSize += char.xadvance + spacing
            }


            let xPos = 0;
            if (align == TEXT_ALIGN.CENTER) xPos = -lineSize / 2;
            if (align == TEXT_ALIGN.RIGHT) xPos = -lineSize;

            for (let i = 0; i < lineLength; i++) {
                let c = l.charCodeAt(i);
                if (c == 42) {
                    isBold++;
                    isBold %= 2;
                    continue
                }
                let char = this.charArray[c];

                let offX = char.xOffset;
                let offY = char.yOffset;

                vertices[verticesCount++] = xPos + offX;
                vertices[verticesCount++] = -offY + yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x;
                uv[uvCount++] = char.uvPos.y;
                uv[uvCount++] = isBold;
                uv[uvCount++] = xPos + offX;
                vertices[verticesCount++] = char.w + xPos + offX;
                vertices[verticesCount++] = -offY + yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x + char.uvSize.x;
                uv[uvCount++] = char.uvPos.y;
                uv[uvCount++] = isBold;
                uv[uvCount++] = xPos + offX;
                vertices[verticesCount++] = xPos + offX;
                vertices[verticesCount++] = -char.h - offY + yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x;
                uv[uvCount++] = char.uvPos.y + char.uvSize.y;
                uv[uvCount++] = isBold;
                uv[uvCount++] = xPos + offX;
                vertices[verticesCount++] = char.w + xPos + offX;
                vertices[verticesCount++] = -char.h - offY + yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x + char.uvSize.x;
                uv[uvCount++] = char.uvPos.y + char.uvSize.y;
                uv[uvCount++] = isBold;
                uv[uvCount++] = xPos + offX;


                indices[indicesCount++] = indicesPos;
                indices[indicesCount++] = 2 + indicesPos;
                indices[indicesCount++] = 1 + indicesPos;


                indices[indicesCount++] = 3 + indicesPos;
                indices[indicesCount++] = 1 + indicesPos;

                indices[indicesCount++] = 2 + indicesPos;
                indicesPos += 4;
                xPos += char.xadvance + spacing;
            }
            yPos -= 50 / 300;
        }

        let m = new Mesh(this.renderer, "fontText");


        m.setTangents(uv)
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

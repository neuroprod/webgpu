import Vec2 from "../math/Vec2";

export class Char {
    public uv0: Vec2 = new Vec2(0, 0);
    public uv1: Vec2 = new Vec2(1, 0);
    public uv2: Vec2 = new Vec2(1, 1);
    public uv3: Vec2 = new Vec2(0, 1);
}

export default class Font {
    static charSize = new Vec2(7, 9);
    static iconSize = new Vec2(16, 16);
    static textureSize = new Vec2(128, 128);

    static chars: Array<Char> = [];
    static icons: Array<Char> = [];

    static getTextSize(text: string) {
        return new Vec2(this.charSize.x * text.length, this.charSize.y);
    }

    static init() {
        let uvXSize = this.charSize.x / this.textureSize.x;
        let uvYSize = this.charSize.y / this.textureSize.y;
        let numChars = 128 - 32;
        let fontPosX = 0;
        let fontPosY = 0;
        for (let i = 0; i < numChars; i++) {
            let c = new Char();
            c.uv0 = new Vec2(uvXSize * fontPosX, 1 - uvYSize * fontPosY);
            c.uv1 = c.uv0.clone().add(new Vec2(uvXSize, 0));
            c.uv2 = c.uv0.clone().add(new Vec2(uvXSize, -uvYSize));
            c.uv3 = c.uv0.clone().add(new Vec2(0, -uvYSize));
            this.chars.push(c);
            fontPosX++;
            if (fontPosX > 17) {
                fontPosX = 0;
                fontPosY++;
            }
        }
        uvXSize = this.iconSize.x / this.textureSize.x;
        uvYSize = this.iconSize.y / this.textureSize.y;
        numChars = 4 * 8;
        fontPosX = 0;
        fontPosY = 4;
        for (let i = 0; i < numChars; i++) {
            let c = new Char();
            c.uv0 = new Vec2(uvXSize * fontPosX, 1 - uvYSize * fontPosY);
            c.uv1 = c.uv0.clone().add(new Vec2(uvXSize, 0));
            c.uv2 = c.uv0.clone().add(new Vec2(uvXSize, -uvYSize));
            c.uv3 = c.uv0.clone().add(new Vec2(0, -uvYSize));
            this.icons.push(c);
            fontPosX++;
            if (fontPosX > 7) {
                fontPosX = 0;
                fontPosY++;
            }
        }
    }
}

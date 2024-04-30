import Vec2 from "../math/Vec2";

import Rect from "../math/Rect";
import UITexture from "./UITexture";

export class TextureBatchData {
    public posSize: Array<number> = [];
    public uiTexture: UITexture;
    public uvScale: Array<number>;
    public uvOffset: Array<number>;
    public alpha: number;

    constructor(
        rect: Rect,
        uiTexture: UITexture,
        alpha: number,
        uvScale: Vec2,
        uvOffset: Vec2
    ) {
        this.uiTexture = uiTexture;
        this.uvScale = uvScale.getArray();
        this.uvOffset = uvOffset.getArray();
        rect.round();
        this.posSize.push(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y);
        this.alpha = alpha;
    }
}

export default class TextureBatch {
    public textureData: Array<TextureBatchData> = [];

    constructor() {
    }

    addTexture(
        rect: Rect,
        uiTexture: UITexture,
        alpha = 1,
        uvScale: Vec2 = new Vec2(1, 1),
        uvOffset = new Vec2(0, 0)
    ) {
        let t = new TextureBatchData(rect, uiTexture, alpha, uvScale, uvOffset);
        this.textureData.push(t);
    }

    clear() {
        this.textureData = [];
    }
}

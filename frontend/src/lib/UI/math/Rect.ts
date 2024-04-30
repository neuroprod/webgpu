import Vec2 from "./Vec2";

export default class Rect {
    public pos: Vec2;
    public size: Vec2;

    public max: Vec2 = new Vec2();
    public min: Vec2 = new Vec2();

    public br: Vec2 = new Vec2();
    public bl: Vec2 = new Vec2();
    public tr: Vec2 = new Vec2();
    public tl: Vec2 = new Vec2();

    constructor(pos = new Vec2(), size = new Vec2()) {
        this.pos = pos;
        this.size = size;
        this.setMinMax();
    }

    public setMinMax() {
        this.min.copy(this.pos);
        this.max.copy(this.pos).add(this.size);
    }

    public copyPos(v: Vec2) {
        this.pos.x = v.x;
        this.pos.y = v.y;
        this.setMinMax();
    }

    public setPos(x: number, y: number) {
        this.pos.x = x;
        this.pos.y = y;
        this.setMinMax();
    }

    public copySize(v: Vec2) {
        this.size.x = v.x;
        this.size.y = v.y;
        this.setMinMax();
    }

    public setSize(x: number, y: number) {
        this.size.x = x;
        this.size.y = y;
        this.setMinMax();
    }

    getTopLeft() {
        return this.pos;
    }

    getTopRight() {
        this.tr.copy(this.pos);
        this.tr.x += this.size.x;
        return this.tr;
    }

    getBottomLeft() {
        let p = this.pos.clone();
        p.y += this.size.y;
        return p;
    }

    getBottomRight() {
        this.br.copy(this.pos);
        this.br.add(this.size);
        return this.br;
    }

    contains(pos: Vec2) {
        if (pos.x < this.min.x) return false;
        if (pos.x > this.max.x) return false;
        if (pos.y < this.min.y) return false;
        if (pos.y > this.max.y) return false;
        return true;
    }

    copy(rect: Rect) {
        this.pos.copy(rect.pos);
        this.size.copy(rect.size);
        this.setMinMax();
    }

    round() {
        this.pos.round();
        this.size.round();
    }

    containsRect(inR: Rect) {
        if (this.size.x == 0) return false;

        if (inR.size.x == 0) return false;

        let thisBR = this.getBottomRight();
        let inTL = inR.getTopLeft();

        if (thisBR.y < inTL.y) {
            return false;
        }
        let thisTL = this.getTopLeft();
        let inBR = inR.getBottomRight();

        if (thisTL.y > inBR.y) {
            return false;
        }

        return true;
    }

    clone() {
        let r = new Rect();
        r.pos.copy(this.pos);
        r.size.copy(this.size);
        return r;
    }

    resizeToFit(clipRect: Rect) {
        if (this.pos.y < clipRect.pos.y) {
            let dif = clipRect.pos.y - this.pos.y;
            this.pos.y = clipRect.pos.y;
            this.size.y -= dif;
        }

        if (this.pos.y + this.size.y > clipRect.pos.y + clipRect.size.y) {
            let dif = this.pos.y + this.size.y - (clipRect.pos.y + clipRect.size.y);
            this.size.y -= dif;
        }
    }

    fitIn(parentRect: Rect) {
        if (this.pos.x < parentRect.pos.x) {
            this.size.x -= parentRect.pos.x - this.pos.x;
            this.pos.x = parentRect.pos.x;
        }
        if (this.pos.y < parentRect.pos.y) {
            this.size.y -= parentRect.pos.y - this.pos.y;
            this.pos.y = parentRect.pos.y;
        }
        let br = this.getBottomRight();
        let brP = parentRect.getBottomRight();
        if (br.x > brP.x) {
            this.size.x -= br.x - brP.x;
        }
        if (br.y > brP.y) {
            this.size.y -= br.y - brP.y;
        }
    }
}

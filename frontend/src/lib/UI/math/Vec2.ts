export default class Vec2 {
    public x: number;
    public y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    public set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    public copy(v: Vec2) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    public add(v: Vec2) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    public sub(v: Vec2) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    public round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    equal(v: Vec2) {
        if (v.x === this.x && v.y === this.y) return true;
        return false;
    }

    scale(val: number) {
        this.x *= val;
        this.y *= val;

        return this;
    }

    clamp(min: Vec2, max: Vec2) {
        this.x = Math.max(min.x, this.x);
        this.y = Math.max(min.y, this.y);

        this.x = Math.min(max.x, this.x);
        this.y = Math.min(max.y, this.y);
    }

    max(max: Vec2) {
        this.x = Math.max(max.x, this.x);
        this.y = Math.max(max.y, this.y);
    }

    min(min: Vec2) {
        this.x = Math.max(min.x, this.x);
        this.y = Math.max(min.y, this.y);
    }

    getArray() {
        return [this.x, this.y];
    }

    distance(vec: Vec2) {
        let a = this.x - vec.x;
        let b = this.y - vec.y;
        return Math.sqrt(a * a + b * b);
    }
}

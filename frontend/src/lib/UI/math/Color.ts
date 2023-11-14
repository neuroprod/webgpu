export default class Color {
  static white: Color = new Color(1, 1, 1, 1);
  static black: Color = new Color(0, 0, 0, 1);
  static zero: Color = new Color(0, 0, 0, 0);
  public r: number;
  public g: number;
  public b: number;
  public a: number;

  constructor(r = 1, g = 1, b = 1, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public setHex(hex: string, a = 1) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
      this.r = parseInt(result[1], 16) / 255;
      this.g = parseInt(result[2], 16) / 255;
      this.b = parseInt(result[3], 16) / 255;
    }

    this.a = a;
    return this;
  }

  gray(val: number) {
    this.r = val;
    this.g = val;
    this.b = val;
    return this;
  }

  public getHSVArray() {
    const l = Math.max(this.r, this.g, this.b);
    const s = l - Math.min(this.r, this.g, this.b);
    const h = s
      ? l === this.r
        ? (this.g - this.b) / s
        : l === this.g
        ? 2 + (this.b - this.r) / s
        : 4 + (this.r - this.g) / s
      : 0;
    let hf = h / (Math.PI * 2);
    if (hf < 0) hf += 1;
    return [hf, s, l];
  }

  public setHSV(h: number, s: number, v: number) {
    h *= 360;
    let f = (n: number, k = (n + h / 60) % 6) =>
      v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    this.r = f(5);
    this.g = f(3);
    this.b = f(1);
  }

  copy(color: Color) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    this.a = color.a;
  }

  equal(v: Color) {
    if (v.r === this.r && v.g === this.g && v.b === this.b && v.a === this.a)
      return true;
    return false;
  }

  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  toString() {
    return (
      this.r.toPrecision(2) +
      "," +
      this.g.toPrecision(2) +
      "," +
      this.b.toPrecision(2) +
      "," +
      this.a.toPrecision(2)
    );
  }

  set(r: number, g: number, b: number, a: number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  getArray() {
    return [this.r, this.g, this.b, this.a];
  }
}

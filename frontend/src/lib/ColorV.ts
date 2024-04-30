import {Vector4} from "math.gl";

export default class ColorV extends Vector4 {
    get r(): number {
        return this[0];
    }

    set r(value: number) {
        this[0] = value;
    }

    get g(): number {
        return this[1];
    }

    set g(value: number) {
        this[1] = value;
    }

    get b(): number {
        return this[2];
    }

    set b(value: number) {
        this[2] = value;
    }

    get a(): number {
        return this[3];
    }

    set a(value: number) {
        this[3] = value;
    }
}

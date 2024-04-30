export default class Noise1D {
    private perm = new Int8Array(257);

    constructor() {
        for (let i = 0; i < 256; i++) {
            this.perm[i] = i & 1 ? 1 : -1;
        }

        for (let i = 0; i < 256; i++) {
            let j = (Math.random() * 4294967296) & 255;

            [this.perm[i], this.perm[j]] = [this.perm[j], this.perm[i]];
        }
        this.perm[256] = this.perm[0];

    }

    noise1d(x) {
        let x0 = x | 0;
        let x1 = x - x0;
        let xi = x0 & 255;
        let fx = (3 - 2 * x1) * x1 * x1;
        let a = x1 * this.perm[xi];
        let b = (x1 - 1) * this.perm[xi + 1];

        return a + fx * (b - a);
    }

    noise(x) {
        let sum = 0;

        sum += (1 + this.noise1d(x)) * 0.25;
        sum += (1 + this.noise1d(x * 2)) * 0.125;
        sum += (1 + this.noise1d(x * 4)) * 0.0625;
        sum += (1 + this.noise1d(x * 8)) * 0.03125;

        return sum;
    }
}




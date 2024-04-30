import Texture from "./Texture";
import {TextureFormat} from "../WebGPUConstants";
import Renderer from "../Renderer";
import {Vector3} from "math.gl";


export default class DefaultTextures {
    private static white: Texture;
    private static black: Texture;
    private static grid: Texture;
    private static normal: Texture;
    private static mre: Texture;
    private static cube: Texture;

    private static depth: Texture;
    private static magicNoise: Texture;


    static getMRE(render: Renderer) {
        if (this.mre) return this.mre;

        this.mre = new Texture(render, "defaultWhite", {
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.mre.make()

        let f = new Uint8ClampedArray(4);
        f[0] = 0;
        f[1] = 180;
        f[2] = 0;
        f[3] = 255;
        this.mre.writeTexture(f, 1, 1, 4);

        return this.mre;
    }

    static getDepth(render: Renderer) {
        if (this.depth) return this.depth;

        this.depth = new Texture(render, "defaultWhite", {
            format: TextureFormat.Depth16Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.depth.make()

        return this.depth;
    }

    static getWhite(render: Renderer) {
        if (this.white) return this.white;

        this.white = new Texture(render, "defaultWhite", {
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.white.make()

        let f = new Uint8ClampedArray(4);
        f.fill(255);

        this.white.writeTexture(f, 1, 1, 4);

        return this.white;
    }

    static getCube(render: Renderer) {
        if (this.cube) return this.cube;

        this.cube = new Texture(render, "defaultCube", {
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            width: 1, height: 1, depthOrArrayLayers: 6
        })

        this.cube.make()

        let f = new Uint8ClampedArray(4);
        f[0] = 255;
        f[1] = 0.0;
        f[2] = 255;
        f[3] = 255;
        this.cube.writeTexture(f, 1, 1, 4);


        return this.cube;
    }

    static getBlack(render: Renderer) {
        if (this.black) return this.black;

        this.black = new Texture(render, "defaultBlack", {
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.black.make()

        let f = new Uint8ClampedArray(4);
        f.fill(0);
        this.black.writeTexture(f, 1, 1, 4);

        return this.black;
    }

    static getNormal(render: Renderer) {
        if (this.normal) return this.normal;

        this.normal = new Texture(render, "defaultNormal", {
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.normal.make()

        let f = new Uint8ClampedArray(4);
        f[0] = 128;
        f[1] = 128;
        f[2] = 255;
        f[3] = 255;
        this.normal.writeTexture(f, 1, 1, 4);

        return this.normal;
    }

    static getGrid(render: Renderer) {
        if (this.grid) return this.grid;

        this.grid = new Texture(render, "defaultGrid", {
            width: 20,
            height: 20,
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.grid.make()

        let f = new Uint8ClampedArray(20 * 20 * 4);
        let count = 0;

        for (let x = 0; x < 20; x++) {
            for (let y = 0; y < 20; y++) {
                let countColor = x + y;
                let s = Math.floor(((countColor % 2) * 0.5 + 0.3) * 256);

                f[count++] = s
                f[count++] = s
                f[count++] = s
                f[count++] = 255;
            }
        }

        this.grid.writeTexture(f, 20, 20, 4 * 20);

        return this.grid;
    }

    static getMagicNoise(render: Renderer): Texture {
        if (this.magicNoise) return this.magicNoise;


        let size = 3
        this.magicNoise = new Texture(render, "magicNoise", {
            width: size,
            height: size,
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.magicNoise.make();
        const magicSquare = this.generateMagicSquare(size);
        const noiseSquareSize = magicSquare.length;
        const data = new Uint8Array(noiseSquareSize * 4);

        for (let inx = 0; inx < noiseSquareSize; ++inx) {

            const iAng = magicSquare[inx];
            const angle = (2 * Math.PI * iAng) / noiseSquareSize;
            const randomVec = new Vector3(
                Math.cos(angle),
                Math.sin(angle),
                0
            ).normalize();
            data[inx * 4] = (randomVec.x * 0.5 + 0.5) * 255;
            data[inx * 4 + 1] = (randomVec.y * 0.5 + 0.5) * 255;
            data[inx * 4 + 2] = 127;
            data[inx * 4 + 3] = 255;

        }
        this.magicNoise.writeTexture(data, size, size, 4 * size);
        return this.magicNoise;

    }

    static generateMagicSquare(size = 5) {

        const noiseSize = Math.floor(size) % 2 === 0 ? Math.floor(size) + 1 : Math.floor(size);
        const noiseSquareSize = noiseSize * noiseSize;
        const magicSquare = Array(noiseSquareSize).fill(0);
        let i = Math.floor(noiseSize / 2);
        let j = noiseSize - 1;

        for (let num = 1; num <= noiseSquareSize;) {

            if (i === -1 && j === noiseSize) {

                j = noiseSize - 2;
                i = 0;

            } else {

                if (j === noiseSize) {

                    j = 0;

                }

                if (i < 0) {

                    i = noiseSize - 1;

                }

            }

            if (magicSquare[i * noiseSize + j] !== 0) {

                j -= 2;
                i++;
                continue;

            } else {

                magicSquare[i * noiseSize + j] = num++;

            }

            j++;
            i--;

        }

        return magicSquare;
    }


}

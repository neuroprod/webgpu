import Texture from "./Texture";
import {TextureFormat} from "../WebGPUConstants";
import Renderer from "../Renderer";


export default class DefaultTextures {
    private static white: Texture;
    private static black: Texture;
    private static grid: Texture;
    private static normal: Texture;
    private static mre: Texture;
    private static cube: Texture;


    static getMRE(render: Renderer) {
        if (this.mre) return this.mre;

        this.mre = new Texture(render, "defaultWhite", {
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.mre.make()

        let f = new Uint8ClampedArray(4);
        f[0]=0;
        f[1]=180;
        f[2]=0;
        f[3]=255;
        this.mre.writeTexture(f,1,1,4);

        return this.mre;
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

        this.white.writeTexture(f,1,1,4);

        return this.white;
    }
    static getCube(render: Renderer) {
        if (this.cube) return this.cube;

        this.cube = new Texture(render, "defaultCube", {
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            width:1, height: 1, depthOrArrayLayers:6
        })

        this.cube.make()

        let f = new Uint8ClampedArray(4);
        f[0]=255;
        f[1]=0.0;
        f[2]=255;
        f[3]=255;
        this.cube.writeTexture(f,1,1,4);


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
        this.black.writeTexture(f,1,1,4);

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
        f[0]=128;
        f[1]=128;
        f[2]=255;
        f[3]=255;
        this.normal.writeTexture(f,1,1,4);

        return this.normal;
    }
    static getGrid(render: Renderer) {
        if (this.grid) return this.grid;

        this.grid= new Texture(render, "defaultGrid", {
            width:20,
            height:20,
            format: TextureFormat.RGBA8Unorm,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.grid.make()

        let f = new Uint8ClampedArray(20*20*4);
        let count=0;

        for(let x=0;x<20;x++)
        {
            for(let y=0;y<20;y++)
            {
                let countColor =x+y;
                let s =Math.floor(((countColor%2)*0.5+0.3)*256);

                f[count++] = s
                f[count++] = s
                f[count++] = s
                f[count++] = 255;
            }
        }

        this.grid.writeTexture(f,20,20,4*20);

        return this.grid;
    }
}

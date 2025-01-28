

//https://www.npmjs.com/package/msdf-bmfont-xml

import Vec2 from "../math/Vec2.ts";
import boldData from './bold.json'
import regularData from './regular.json'
import iconData from './icons.json'
export class SDFChar {
    w: number = 0;
    h: number = 0;
    uvSize: Vec2 = new Vec2();
    uvPos: Vec2 = new Vec2();


    uv0: Vec2 = new Vec2();
    uv1: Vec2 = new Vec2();
    uv2: Vec2 = new Vec2();
    uv3: Vec2 = new Vec2();



    xadvance: number = 0;
    xOffset: number = 0;
    yOffset: number = 0;
    char: string="";

    constructor(data: any, xUVScale:number,xUVOffset:number,resetOffset:boolean =false) {
        if (!data) return;

        this.w = data.width ;
        this.h = data.height ;
        this.xadvance = data.xadvance;
        this.xOffset = data.xoffset ;
        this.yOffset = data.yoffset;
        if(resetOffset){
            this.xOffset =-this.w/2 ;
            this.yOffset =-this.h/2
        }


        this.uvSize = new Vec2(data.width / 512, data.height / 512)
        this.uvPos = new Vec2(data.x / 512, data.y / 512)
        this.uv0.set((this.uvPos.x)*xUVScale+xUVOffset,1-(this.uvPos.y+this.uvSize.y))
        this.uv1.set((this.uvPos.x+this.uvSize.x)*xUVScale+xUVOffset,1-(this.uvPos.y+this.uvSize.y))
        this.uv2.set((this.uvPos.x)*xUVScale+xUVOffset,1-this.uvPos.y)
        this.uv3.set((this.uvPos.x+this.uvSize.x)*xUVScale+xUVOffset,1-this.uvPos.y)

        this.char =data.char;

    }

}



export default class SDFFont {


    static charArrayRegular: Array<SDFChar> = new Array<SDFChar>(200);
    static charArrayBold: Array<SDFChar> = new Array<SDFChar>(200);
    static charArrayIcons: Array<SDFChar> = new Array<SDFChar>(200);
    constructor() {



        for (let data of regularData.chars) {
            SDFFont.charArrayRegular[data.id] = new SDFChar(data,0.5,0)

        }
        for (let data of boldData.chars) {
            SDFFont.charArrayBold[data.id] = new SDFChar(data,0.5,0.25)

        }
        for (let data of iconData.chars) {
            SDFFont.charArrayIcons[data.id] = new SDFChar(data,0.5,0.5,true)

        }

    }

}

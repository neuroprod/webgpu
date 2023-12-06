import Texture from "./Texture";
import Renderer from "../Renderer";
import MipMapRenderPass from "./MipMapRenderPass";



export default class MipMapQueue{

    private textures:Array<Texture> =[];
    private passesBySize: { [size: number]: MipMapRenderPass } = {};
    private renderer: Renderer;
    constructor(renderer:Renderer) {
        this.renderer=renderer;
    }
    addTexture(texture:Texture){
        this.textures.push(texture);
    }
    public getPassBySize(size:number){
        let p =  this.passesBySize[size];
        if(p)return p;

        p =new MipMapRenderPass(this.renderer,size);
        this.passesBySize[size] = p;
        return p;
    }
    processQue(){
       this.processTexture();
    }
    processTexture(){
        if(this.textures.length==0)return;
        let texture =  this.textures.pop()
        let targetMips = texture.options.mipLevelCount;
        if(texture.options.width !=texture.options.height){console.log("only squares");return;}
        let maxMips =Math.log2(texture.options.width)-1;

        console.log(texture.label,texture.options.mipLevelCount,texture.options.width )
        let count =1;

        let prevTexture = texture;

        for(let i=maxMips;i>(maxMips-targetMips+1);i--)
        {

            let size =Math.pow(2,i);
            let pass = this.getPassBySize(size)
            console.log(i,"miplevel "+count,prevTexture.options.width+"->",size)
            pass.setInputTexture(prevTexture)
            pass.add();



            let source: GPUImageCopyTexture = {texture: pass.target.textureGPU};
            let dest: GPUImageCopyTexture = {texture: texture.textureGPU, mipLevel: count};
            this.renderer.commandEncoder.copyTextureToTexture(source, dest, {
                width: size,
                height: size
            })




            prevTexture=pass.target;
            count++;
        }


    }
}

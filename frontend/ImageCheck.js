const fs = require("fs");
const pixels = require('image-pixels');
const sharp = require('sharp');
const targetDir = "./public/textures/";
let files =[]


function loadNext(){
    if(files.length===0){
        console.log("done")
        return;
    }

    let file = files.pop();

    pixels(file).then((data)=>{
        let arr = data.data;
        let numChannels =arr.length/(data.width*data.height);


        if(numChannels!==4) loadNext();
        let r =arr[0];
        let g =arr[1];
        let b=arr[2];
        let a =arr[3];
        let same =true;
        for (let i=0;i< arr.length;i+=4)
        {
            if(r !== arr[i]){
                same =false;
                break;
            }
            if(g !== arr[i+1]){
                same =false;
                break;
            }
            if(b !== arr[i+2]){
                same =false;
                break;
            }
            if(a !== arr[i+3]){
                same =false;
                break;
            }
        }
        if(same){
            console.log(file, data.width,data.height)
            sharp(file).resize(16).toFile("temp.png").then(()=>{
                fs.copyFileSync("temp.png", file)
                loadNext();
            })
        }else{
            loadNext();
        }

    })
}
function getImages() {
    console.log("files");
    fs.readdirSync(targetDir).forEach(file => {
        if (file.includes(".png")) {

            files.push(targetDir+file)
        }
    });

    loadNext();
}

getImages();

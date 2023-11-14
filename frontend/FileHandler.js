const fs = require("fs");

const watchDir="../../assets/exports/"
const targetDir="./public/textures/"
const targetDirData="./public/"
const targetDirPreload="./src"

var jsonObj ={}



function makeJson()
{
    jsonObj ={}
    let data=[];
    fs.readdirSync(watchDir).forEach(file => {
        if(file.includes(".png")){


        let index =file.indexOf(".png");
        let name =file.substring(0,index);

            data.push(name)
        }
    });
    jsonObj.data =data;

    let dataS =
        '// to generate this file -> node FileHandler\n' +
        'export const preloadImages = ' +
        JSON.stringify(data, null, '  ');


        fs.writeFileSync(targetDirPreload + '/PreloadData.ts', dataS);

}

function processFileName(file){
    fs.copyFileSync(watchDir+file,targetDir+file)
}


var timeoutID;
var changedFiles=[]

function updateChangedFiles()
{

    let tempArray=[]
    tempArray =tempArray.concat(changedFiles);
    changedFiles=[];
    console.log("changedfiles:", tempArray)
    for (let filename of tempArray)
    {
        if(filename.includes(".png")){
            processFileName(filename);

        }
        if(filename.includes(".bin")){
            fs.copyFileSync(watchDir+filename,targetDirData+filename)

        }
        if(filename.includes(".gltf")){
            let targetFilename =filename;
            targetFilename= targetFilename.replace(".gltf",'.json');

            fs.copyFileSync(watchDir+filename,targetDirData+targetFilename)

        }
    }

    makeJson();

}
function start() {


    makeJson()
    console.log("watching " + watchDir);
    fs.watch(watchDir, function(eventType, filename) {

        //processFile(filename)
        clearTimeout(timeoutID)
        timeoutID =setTimeout(updateChangedFiles, 2000)
        if(!changedFiles.includes(filename)){
            changedFiles.push(filename);

        }

    })

}
start();

const fs = require("fs");

const watchDir = "../../assets/exports/"
const targetDir = "./public/textures/"
const targetDirDrawing = "./public/drawings/"
const targetDirData = "./public/"
const targetDirPreload = "./src"
const downloadFolder = "../../../../Downloads/"
var jsonObj = {}


function makeJson() {

    let config = fs.readFileSync("./public/materialData.json", "utf8")
    let configJ = JSON.parse(config);
    let data = [];
    fs.readdirSync(targetDir).forEach(file => {
        if (file.includes(".png")) {
            let use = true;
            if (file.includes("_Op.png")) {
                use = false;
                let indexS = file.indexOf("_Op.png");
                let nameS = file.substring(0, indexS);
               // console.log(nameS,configJ[nameS]["needsAlphaClip"])
                if (!configJ[nameS]) {
                    use = false;
                } else {
                    if (configJ[nameS]["needsAlphaClip"]) {
                        use = true;
                    }
                }
            }
            if (use) {
                let index = file.indexOf(".png");
                let name = file.substring(0, index);

                data.push(name)
            }
        }
    });


    let dataBin = [];
    fs.readdirSync(targetDirDrawing).forEach(file => {
        if (file.includes(".bin")) {


            let index = file.indexOf(".bin");
            let name = file.substring(0, index);

            dataBin.push(name)
        }
    });


    let dataS =
        '// to generate this file -> node FileHandler\n' +
        'export const preloadImages = ' +
        JSON.stringify(data, null, '  ') +
        '\n' +
        'export const preloadDrawings = ' +
        JSON.stringify(dataBin, null, '  ') +
        '\n' +
        'export const materialData =' + config;

    fs.writeFileSync(targetDirPreload + '/PreloadData.ts', dataS);

}

function processFileName(file) {
    fs.copyFileSync(watchDir + file, targetDir + file)
}


var timeoutID;
var changedFiles = []

function updateChangedFiles() {

    let tempArray = []
    tempArray = tempArray.concat(changedFiles);
    changedFiles = [];
    console.log("changedfiles:", tempArray)
    for (let filename of tempArray) {
        if (!fs.existsSync(watchDir + filename)) continue;
        if (filename.includes(".png")) {
            processFileName(filename);

        }
        if (filename.includes(".bin")) {
            fs.copyFileSync(watchDir + filename, targetDirData + filename)

        }
        if (filename.includes(".gltf")) {
            let targetFilename = filename;
            targetFilename = targetFilename.replace(".gltf", '.json');

            fs.copyFileSync(watchDir + filename, targetDirData + targetFilename)

        }
    }

    makeJson();

}

function updateChangedFilesDownload() {

    let tempArray = []
    tempArray = tempArray.concat(changedFiles);
    changedFiles = [];
    console.log("changedfiles:", tempArray)
    for (let filename of tempArray) {
        if (!fs.existsSync(downloadFolder + filename)) continue;
        if (filename.includes("materialData.json")) {

            fs.copyFileSync(downloadFolder + filename, targetDirData + filename)
            fs.unlinkSync(downloadFolder + filename)


        }
        if (filename.includes("lightRoom.json")) {

            fs.copyFileSync(downloadFolder + filename, targetDirData + filename)
            fs.unlinkSync(downloadFolder + filename)


        }
        if (filename.includes(".bin")) {
            fs.copyFileSync(downloadFolder + filename, targetDirDrawing + filename)
            fs.unlinkSync(downloadFolder + filename)
        }

    }

    makeJson();

}

function start() {


    makeJson()
    console.log("watching " + watchDir);
    console.log("watching " + downloadFolder);
    fs.watch(watchDir, function (eventType, filename) {

        //processFile(filename)
        clearTimeout(timeoutID)
        timeoutID = setTimeout(updateChangedFiles, 2000)
        if (!changedFiles.includes(filename)) {
            changedFiles.push(filename);

        }

    })

    fs.watch(downloadFolder, function (eventType, filename) {

        //processFile(filename)
        clearTimeout(timeoutID)
        timeoutID = setTimeout(updateChangedFilesDownload, 2000)
        if (!changedFiles.includes(filename)) {
            changedFiles.push(filename);

        }

    })

}

start();

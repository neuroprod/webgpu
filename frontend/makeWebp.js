const fs = require("fs");

const sharp = require('sharp');
const targetDir = "./public/textures/";
const targetDir2 = "./public/UI/";
let files = []


function loadNext() {
    if (files.length === 0) {
        console.log("done")
        return;
    }

    let file = files.pop();

    let fileNew = file;
    fileNew = fileNew.replace(".png", ".webp")
console.log(fileNew)

    if (fileNew.includes("MRA")) {
        sharp(file).webp({nearLossless: true}).toFile(fileNew).then(() => {
            loadNext();
        })
    } else {
        sharp(file).toFile(fileNew).then(() => {
            loadNext();
        })
    }

}

function getImages() {
    console.log("files");
    fs.readdirSync(targetDir).forEach(file => {
        if (file.includes(".png")) {

            files.push(targetDir + file)
        }
    });
    fs.readdirSync(targetDir2).forEach(file => {
        if (file.includes(".png")) {

            files.push(targetDir2 + file)
        }
    });
    loadNext();
}

getImages();

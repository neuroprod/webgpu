import UI from "./UI/UI";


function download(content:string, fileName:string, contentType:string) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
export function saveToJsonFile(data:any,filename:string) {
    let dataString = JSON.stringify(data);
    download(dataString, filename+".json", "text/plain");
    UI.logEvent("Downloading", filename+".json");
}

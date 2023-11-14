import UI_I from "../UI_I";

export default class Local {
  static dockData: any = null;
  static itemData = {};
  static uiData = {};
  private static isDirty: boolean;

  static init() {

    // @ts-ignore
    if (!this.uiData["itemData"]) {
      // @ts-ignore
      this.uiData["itemData"] = this.itemData;
      // @ts-ignore
      this.uiData["dockData"] = this.dockData;
    }
    if (UI_I.rendererGPU) return;
    let data = localStorage.getItem("uiData");

    if (data) {
      this.uiData = JSON.parse(data);
      // @ts-ignore
      this.itemData = this.uiData["itemData"];
      // @ts-ignore
      this.dockData = this.uiData["dockData"];
    } else {
    }
  }

  static setItem(id: number, data: any) {
    // @ts-ignore
    this.uiData["itemData"][id] = data;
    this.isDirty = true;
  }

  static getItem(id: number): any {
    // @ts-ignore
    return this.uiData["itemData"][id];
  }
  static getAndDeletItem(id:number) {
    // @ts-ignore
    let r = this.uiData["itemData"][id];
    // @ts-ignore
    delete this.uiData["itemData"][id];
    return r;
  }
  static setDockData(data: any) {
    // @ts-ignore
    this.uiData["dockData"] = data;
    this.isDirty = true;
  }

  static saveData() {
    if (!this.isDirty) return;
    if (UI_I.rendererGPU) return;
    if (UI_I.crashed) return;
    let s = JSON.stringify(this.uiData);
    localStorage.setItem("uiData", s);

    this.isDirty = false;
  }

  static clearLocalData() {
    localStorage.removeItem("uiData");
  }

  static saveToJson() {
    let data = JSON.stringify(this.uiData);
    this.download(data, "uiSettings.json", "text/plain");
  }

  static download(content:string, fileName:string, contentType:string) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  static setSettings(settings: any) {
    this.uiData = settings;
    // @ts-ignore
    this.dockData = this.uiData["dockData"];
    // @ts-ignore
    this.itemData = this.uiData["itemData"];
  }
}

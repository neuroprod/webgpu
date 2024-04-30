import PreLoader from "./lib/PreLoader";


export default class JSONLoader {

    data: any;


    constructor(url: string, preLoader: PreLoader) {

        preLoader.startLoad();
        this.loadURL(url).then(() => {
            preLoader.stopLoad();
        });

    }

    async loadURL(url: any) {

        const response = await fetch(url + ".json")
        let text = await response.text()
        this.data = JSON.parse(text)

    }
}

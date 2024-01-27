class UIData{
    sceneObjects: boolean;
    get debug(): boolean {
        return this._debug;
    }

    set debug(value: boolean) {
        this._debug = value;
    }
    get performance(): boolean {
        return this._performance;
    }

    set performance(value: boolean) {
        this._performance = value;
    }

    private _performance =false
    private _debug:boolean=false;

    constructor() {
    }


}
export default new UIData()

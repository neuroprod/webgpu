class UIData{
    get performance(): boolean {
        return this._performance;
    }

    set performance(value: boolean) {
        this._performance = value;
    }

    private _performance =false

    constructor() {
    }


}
export default new UIData()

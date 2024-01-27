class UIData{
    get sceneObjects(): boolean {
        return this._sceneObjects;
    }

    set sceneObjects(value: boolean) {
        if( this._sceneObjects != value) {
            this._sceneObjects = value;
            this.save()
        }
    }
    get gameState(): boolean {
        return this._gameState;
    }

    set gameState(value: boolean) {

        if( this._gameState != value) {
            this._gameState = value;
            this.save()
        }
    }

    get debug(): boolean {
        return this._debug;
    }

    set debug(value: boolean) {
        if( this._debug != value) {
        this._debug = value;
        this.save()
        }
    }
    get performance(): boolean {
        return this._performance;
    }

    set performance(value: boolean) {
        if( this._performance != value) {
        this._performance = value;
        }
    }

    private _performance =false
    private _debug:boolean=false;
    private _sceneObjects: boolean=false;
    private _gameState: boolean=false;
    constructor() {
    }
    init(){
        let dataS = localStorage.getItem("devData")
        let data = JSON.parse(dataS)
        if(data){
            console.log(data);

            for (let value of Object.keys(data)) {

                this[value] =data[value];
            }
        }
    }
    save(){
        let s = JSON.stringify(this);
console.log("save")
       localStorage.setItem("devData", s);
    }

}
export default new UIData()

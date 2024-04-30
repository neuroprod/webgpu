class UIData {
    get work(): boolean {
        return this._work;
    }

    set work(value: boolean) {
        if (this._work != value) {
            this._work = value;
            this.save()
        }
    }

    private _work: boolean = false;

    get useTimestamp(): boolean {
        return this._useTimestamp;
    }

    set useTimestamp(value: boolean) {
        if (this._useTimestamp != value) {
            this._useTimestamp = value;
            this.save()
        }

    }

    private _useTimestamp: boolean = false;

    get face(): boolean {
        return this._face;
    }

    set face(value: boolean) {

        if (this._face != value) {
            this._face = value;
            this.save()
        }
    }

    private _face: boolean = false;

    get draw(): boolean {
        return this._draw;
    }

    set draw(value: boolean) {
        if (this._draw != value) {
            this._draw = value;
            this.save()
        }

    }

    private _draw: boolean = false;

    constructor() {
    }

    private _animation: boolean = false;
    get animation(): boolean {
        return this._animation;
    }

    set animation(value: boolean) {

        if (this._animation != value) {
            this._animation = value;
            this.save()
        }
    }

    private _lightOutside: boolean = false;

    get lightOutside(): boolean {
        return this._lightOutside;
    }

    set lightOutside(value: boolean) {
        if (this._lightOutside != value) {
            this._lightOutside = value;
            this.save()
        }

    }

    private _lightInside: boolean = false;

    get lightInside(): boolean {
        return this._lightInside;
    }

    set lightInside(value: boolean) {
        if (this._lightInside != value) {
            this._lightInside = value;
            this.save()
        }

    }

    private _devSpeed: boolean = false;

    get devSpeed(): boolean {
        return this._devSpeed;
    }

    set devSpeed(value: boolean) {
        if (this._devSpeed != value) {
            this._devSpeed = value;
            this.save()
        }
    }

    private _performance = false

    get performance(): boolean {
        return this._performance;
    }

    set performance(value: boolean) {
        if (this._performance != value) {
            this._performance = value;
        }
    }

    private _debug: boolean = false;

    get debug(): boolean {
        return this._debug;
    }

    set debug(value: boolean) {
        if (this._debug != value) {
            this._debug = value;
            this.save()
        }
    }

    private _sceneObjects: boolean = false;

    get sceneObjects(): boolean {
        return this._sceneObjects;
    }

    set sceneObjects(value: boolean) {
        if (this._sceneObjects != value) {
            this._sceneObjects = value;
            this.save()
        }
    }

    private _gameState: boolean = false;

    get gameState(): boolean {
        return this._gameState;
    }

    set gameState(value: boolean) {

        if (this._gameState != value) {
            this._gameState = value;
            this.save()
        }
    }

    private _renderSettings: boolean = false;

    get renderSettings(): boolean {
        return this._renderSettings;
    }

    set renderSettings(value: boolean) {

        if (this._renderSettings != value) {
            this._renderSettings = value;
            this.save()
        }
    }

    init() {
        let dataS = localStorage.getItem("devData")
        let data = JSON.parse(dataS)
        if (data) {
            for (let value of Object.keys(data)) {
                if (data[value] != undefined)
                    this[value] = data[value];
            }
        }
    }

    save() {
        let s = JSON.stringify(this);

        localStorage.setItem("devData", s);
    }

}

export default new UIData()

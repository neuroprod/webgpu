export default class Transition{
    public onComplete: () => void;

    constructor() {
    }
    set(onComplete: () => void,data=""){
        this.onComplete =onComplete;

    }

    onMouseDown(){

    }
}

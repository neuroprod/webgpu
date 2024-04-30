export default class Transition {
    public onComplete: () => void;

    public name = "";

    constructor() {
    }

    set(onComplete: () => void, data = "") {
        this.onComplete = onComplete;

    }

    onMouseDown() {

    }
}

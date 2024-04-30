import {Vector2} from "math.gl";


export default class MouseListener {
    private element: Document;

    private preventDefault = false;
    public mousePos: Vector2;
    public mousePosDown: Vector2;
    public isDown: boolean = false;
    public isDownThisFrame: boolean = false;
    public isUpThisFrame: boolean = false;
    public isDirty: number = 1;
    public wheelDelta: number = 0;

    constructor(element: HTMLElement) {
        this.element = document;

        this.element.addEventListener(
            "mousemove",
            this.mouseMoveListener.bind(this),
            false
        );
        this.element.addEventListener(
            "touchmove",
            this.touchMoveListener.bind(this),
            {passive: true}
        );

        this.element.addEventListener(
            "touchstart",
            this.touchStartListener.bind(this),
            {passive: true}
        );
        this.element.addEventListener(
            "mousedown",
            this.mouseDownListener.bind(this),
            false
        );

        this.element.addEventListener("touchend", this.mouseUp.bind(this), false);
        this.element.addEventListener("mouseup", this.mouseUp.bind(this), false);

        this.element.addEventListener(
            "mousecancel",
            this.cancelListener.bind(this),
            false
        );
        this.element.addEventListener(
            "mouseout",
            this.endListener.bind(this),
            false
        );
        this.element.addEventListener(
            "touchcancel",
            this.endListener.bind(this),
            false
        );

        this.element.addEventListener("wheel", (event) => {
            this.wheelDelta = event.deltaY;
        });
        document.addEventListener("mouseleave", (event) => {

            if (event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight)) {


                this.mousePos.set(-1, -1);

            }
        });
        this.mousePos = new Vector2(-1, -1);
        this.mousePosDown = new Vector2(-1, -1);
    }

    touchStartListener(e: TouchEvent) {
        this.setMousePosition(e.targetTouches[0]);
        if (this.preventDefault) {
            e.preventDefault();
        }
        this.mouseDown();
    }

    mouseDownListener(e: MouseEvent) {
        if (e.which - 1 == 0) {
            this.setMousePosition(e);
            if (this.preventDefault) {
                e.preventDefault();
            }
            this.mouseDown();
        }
    }

    touchMoveListener(e: TouchEvent) {
        this.setMousePosition(e.targetTouches[0]);
        if (this.preventDefault) {
            e.preventDefault();
        }
    }

    mouseMoveListener(e: MouseEvent) {

        this.setMousePosition(e);
        if (this.preventDefault) {
            e.preventDefault();
        }
    }

    cancelListener() {
        console.log("cancels")
        this.isDown = false;
        this.isDownThisFrame = false;
        this.isDirty = 1;
    }

    endListener() {
        this.isDown = false;
        this.isDownThisFrame = false;
        this.isDirty = 1;
    }

    mouseDown() {
        this.isDown = true;
        this.isDownThisFrame = true;
        this.mousePosDown = this.mousePos.clone();
        this.isDirty = 1;
    }

    mouseUp() {
        this.isDown = false;
        this.isUpThisFrame = true;
        this.isDirty = 1;
    }

    setMousePosition(e: any) {
        this.mousePos.x = e.offsetX;
        this.mousePos.y = e.offsetY;
        this.isDirty = 1;
    }

    reset() {
        this.isUpThisFrame = false;
        this.isDownThisFrame = false;
        this.isDirty--;
    }
}

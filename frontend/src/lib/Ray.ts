import {Vector2, Vector3, Vector4} from "math.gl";
import Camera from "./Camera";
import Renderer from "./Renderer";

export default class Ray{
    private renderer: Renderer;
    private rayStart: Vector3;
    private rayDir: Vector3;

    constructor(renderer:Renderer) {
        this.renderer =renderer;

    }
    setFromCamera(camera:Camera,mousePosIn:Vector2)
    {
        let mousePos = mousePosIn.clone().scale(new Vector2(2 / (this.renderer.width / this.renderer.pixelRatio), 2 / (this.renderer.height / this.renderer.pixelRatio)))
        let pos = new Vector4(mousePos.x - 1, (mousePos.y - 1) * -1, 1, 1);
        if (camera.viewProjectionInv) {
            pos.transform(camera.viewProjectionInv);
            this.rayStart = camera.cameraWorld.clone()
            this.rayDir = new Vector3(pos.x - this.rayStart.x, pos.y - this.rayStart.y, pos.z - this.rayStart.z).normalize()
        }
    }



}

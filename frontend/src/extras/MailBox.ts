import GLFTLoader from "../GLFTLoader";
import UI from "../lib/UI/UI";
import Model from "../lib/model/Model";

export default class MailBox {
    private flag: Model;
    private door: Model;
    private package: Model;
    private state: number;
    private mailBox: Model;

    constructor(outside: GLFTLoader) {
        this.mailBox = outside.modelsByName["mailBox"];

        this.flag = outside.modelsByName["mailBoxFlag"];
        this.door = outside.modelsByName["mailBoxDoor"];
        this.package = outside.modelsByName["package"];
        //this.mailBox.hitFriends.push(  this.flag )
        //this.mailBox.hitFriends.push(  this.door )

        this.setState(0)

    }

    setState(state: number) {
        this.state = state;
        if (state == 0) {
            this.flag.setEuler(0, 0, 0);
            this.door.setEuler(0, 0, 0)
            this.package.visible = false;
            this.mailBox.enableHitTest = true
            this.package.enableHitTest = false;
        } else if (state == 1) {
            this.flag.setEuler(0, 0, Math.PI / 2);
            this.door.setEuler(0, 0, Math.PI * 0.95)
            this.package.visible = true;
            this.mailBox.enableHitTest = false
            this.flag.enableHitTest = false
            this.door.enableHitTest = false
            this.package.enableHitTest = true;


        } else if (state == 2) {
            this.flag.setEuler(0, 0, Math.PI / 2);
            this.door.setEuler(0, 0, Math.PI * 0.95)
            this.package.visible = false;
            this.mailBox.enableHitTest = false
            this.package.enableHitTest = false;
        }
    }

    onUI() {
        UI.separator("mailBox");
        if (UI.LButton("noMail")) {
            this.setState(0)
        }
        if (UI.LButton("Mail")) {
            this.setState(1)
        }
        if (UI.LButton("TakeMail")) {
            this.setState(2)
        }
    }
}

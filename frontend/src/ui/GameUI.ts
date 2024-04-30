import Renderer from "../lib/Renderer";
import PreLoader from "../lib/PreLoader";
import Camera from "../lib/Camera";
import GameModel, {StateGold, Transitions, UIState} from "../../public/GameModel";
import UIModelRenderer from "./UIModelRenderer";
import {Vector2} from "math.gl";
import UIModel from "../lib/model/UIModel";
import MenuButton from "./MenuButton";
import Inventory from "./Inventory";
import Menu from "./Menu";
import InventoryDetail from "./InventoryDetail";
import EnterButton from "./EnterButton";
import Cursor, {CURSOR} from "./Cursor";
import Note from "./Note";
import Endscreen from "./Endscreen";


export default class GameUI {


    modelRenderer: UIModelRenderer;
    public cursor: Cursor;
    menu: Menu;
    private camera: Camera;
    private renderer: Renderer;
    private root: UIModel;
    private downItem: UIModel = null;
    private overItem: UIModel = null;
    private menuButton: MenuButton;
    private inventory: Inventory;
    private inventoryDetail: InventoryDetail;
    private enterButton: EnterButton;
    private state: UIState = UIState.PRELOAD;
    private note: Note;
    private endscreen: Endscreen;

    constructor(renderer: Renderer, preLoader: PreLoader) {

        this.renderer = renderer;
        this.camera = new Camera(renderer, "uiCamera");
        this.camera.perspective = false;


        this.root = new UIModel(renderer, "uiRoot");

        this.endscreen = new Endscreen(renderer, preLoader)
        this.root.addChild(this.endscreen)

        this.cursor = new Cursor(renderer, preLoader)
        this.root.addChild(this.cursor);

        this.modelRenderer = new UIModelRenderer(renderer, "UIModelRenderer")
        this.modelRenderer.camera = this.camera;


        this.inventoryDetail = new InventoryDetail(renderer, preLoader);
        this.root.addChild(this.inventoryDetail);
        this.menuButton = new MenuButton(renderer, preLoader);

        this.root.addChild(this.menuButton);

        this.inventory = new Inventory(renderer, preLoader)

        this.root.addChild(this.inventory);

        this.menu = new Menu(renderer, preLoader)

        this.root.addChild(this.menu);

        this.enterButton = new EnterButton(renderer, preLoader)
        this.enterButton.visible = false;

        this.root.addChild(this.enterButton);

        this.note = new Note(renderer, preLoader)
        this.root.addChild(this.note)

        // this.test.setEuler(Math.PI,0,0)

        this.menuButton.hide()
        this.inventory.hide()
        this.modelRenderer.models = [];
    }

    public init() {


    }

    public update() {
        this.updateCamera()


    }

    updateMouse(mousePos: Vector2, mouseDownThisFrame: boolean, mouseUpThisFrame: boolean) {

        if (this.state == UIState.PRELOAD_DONE && mouseDownThisFrame) {
            this.state = UIState.PRELOAD_DONE_WAIT
            GameModel.introDraw.hideDelay(0);
            this.cursor.hide();
            setTimeout(() => {
                GameModel.setTransition(Transitions.START_GAME)

            }, 1000)


        }
        this.cursor.setMousePos(mousePos);

        let r = this.root.checkMouse(mousePos)
        if (r) {
            if (mouseDownThisFrame) {
                this.downItem = r;
                this.downItem.onDown()
            }

            if (this.downItem == r && mouseUpThisFrame) {
                this.downItem.onClick();

            }
            if (r != this.overItem) {
                if (this.overItem) this.overItem.onOut()
                this.overItem = r;
                this.overItem.onOver()
            }

        } else {
            if (this.overItem) this.overItem.onOut()

            this.overItem = null;

        }
        if (mouseUpThisFrame) {
            if (this.downItem) this.downItem.onUp()
            this.downItem = null;
        }
        if (!this.overItem && mouseDownThisFrame) {
            this.inventory.close()
        }

    }

    setUIState(state: UIState, data: any, hasClose: boolean = false) {
        if (state == UIState.PRELOAD) {


        }
        if (state == UIState.PRELOAD_DONE) {
            this.cursor.show(CURSOR.NEXT)
        }
        if (state == UIState.HIDE_MENU) {
            this.menuButton.hide()
            this.inventory.hide()

        }
        if (state == UIState.OPEN_MENU) {
            this.menuButton.hide()
            this.inventory.hide()
            this.menu.show()
        }
        if (state == UIState.GAME_DEFAULT) {
            this.enterButton.visible = false
            this.menuButton.show()
            this.inventory.show()
            this.menu.hide()
            this.inventoryDetail.hide()
            this.note.hide();
        }
        if (state == UIState.INVENTORY_DETAIL) {
            this.menuButton.hide()
            this.inventory.hide()
            this.inventoryDetail.show(data, hasClose)

        }
        if (state == UIState.SHOW_NOTE) {
            this.menuButton.hide()
            this.inventory.hide()
            this.note.show()

        }
        if (state == UIState.END_SCREEN) {
            this.endscreen.show();

        }
        this.state = state
    }

    updateInventory() {
        if (GameModel.pantsFound.length >= 6 && GameModel.stateGold == StateGold.START_MILL) {
            GameModel.stateGold = StateGold.FINISH_KEY;
        }
        this.inventory.updateInventory()

    }

    private updateCamera() {
        this.camera.orthoBottom = GameModel.screenHeight
        this.camera.orthoLeft = 0;
        this.camera.orthoRight = GameModel.screenWidth
        this.camera.orthoTop = 0;
        this.camera.near = -5;
        this.camera.far = 5;
        this.camera.cameraWorld.set(0, 0, 1)
        this.camera.cameraLookAt.set(0, 0, -1)

        this.modelRenderer.models = [];
        this.root.collectChildren(this.modelRenderer.models);
        this.modelRenderer.models.reverse()
    }
}

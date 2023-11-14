import { LeftRightDialogHeader } from "next/dist/client/components/react-dev-overlay/internal/components/LeftRightDialogHeader";

export enum ActionKey {
  None,
  Enter,
  BackSpace,
  ArrowLeft,
  ArrowRight,
  Copy,
}
export default class KeyboardListener {
  private buffer = "";

  actionKey: ActionKey = ActionKey.None;
  constructor() {
    document.addEventListener("keydown", this.onKey.bind(this));
  }
  onKey(event: KeyboardEvent) {
    let key = event.key;

    if (event.key.length > 1) {
      this.setActionKey(key);
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      this.setActionKey(key);
      return;
    }
    if (key.length != 1) return;
    let charCode = key.charCodeAt(0);

    if (charCode < 32 && charCode > 126) return;
    // Alert the key name and key code on keydown
    this.buffer += key;
  }
  setActionKey(key: string) {
    if (key == "Enter") this.actionKey = ActionKey.Enter;
    if (key == "ArrowRight") this.actionKey = ActionKey.ArrowRight;
    if (key == "ArrowLeft") this.actionKey = ActionKey.ArrowLeft;
    if (key == "Backspace") this.actionKey = ActionKey.BackSpace;
    if (key == "v") {
      navigator.clipboard
        .readText()
        .then((text) => {
          this.setToBuffer(text);
        })
        .catch((err) => {
          console.error("Failed to read clipboard contents: ", err);
        });
    }
    if (key == "c") {
      this.actionKey = ActionKey.Copy;
    }
  }
  setToBuffer(text: string) {
    for (let i = 0; i < text.length; i++) {
      let key = text.charAt(i);
      let charCode = key.charCodeAt(0);

      if (charCode < 32 && charCode > 126) continue;
      this.buffer += key;
    }

    //for()
  }
  getActionKey() {
    let k = this.actionKey;
    this.actionKey = ActionKey.None;
    return k;
  }

  getBuffer() {
    let r = this.buffer;
    this.buffer = "";
    return r;
  }
}
